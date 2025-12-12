/**
 * Local Database using SQL.js (SQLite compiled to WebAssembly)
 * This is the Local-First approach: all reads come from here
 */

import initSqlJs, { Database } from 'sql.js';

let db: Database | null = null;

// Schema matching Supabase structure
const LOCAL_SCHEMA = `
-- Projects
CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Entities
CREATE TABLE IF NOT EXISTS entities (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('actor', 'location', 'item', 'rule')),
  project_id TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

-- Timelines
CREATE TABLE IF NOT EXISTS timelines (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  parent_id TEXT,
  is_divergent INTEGER DEFAULT 0,
  project_id TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (parent_id) REFERENCES timelines(id) ON DELETE SET NULL,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

-- Timeline Memberships
CREATE TABLE IF NOT EXISTS timeline_memberships (
  timeline_id TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  spawn_date INTEGER,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'dead', 'hidden')),
  PRIMARY KEY (timeline_id, entity_id),
  FOREIGN KEY (timeline_id) REFERENCES timelines(id) ON DELETE CASCADE,
  FOREIGN KEY (entity_id) REFERENCES entities(id) ON DELETE CASCADE
);

-- Facts (EAV Temporal)
CREATE TABLE IF NOT EXISTS facts (
  id TEXT PRIMARY KEY,
  entity_id TEXT NOT NULL,
  attribute TEXT NOT NULL,
  value TEXT NOT NULL, -- JSON stringified
  valid_from_game_tick INTEGER,
  valid_until_game_tick INTEGER,
  timeline_id TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (entity_id) REFERENCES entities(id) ON DELETE CASCADE,
  FOREIGN KEY (timeline_id) REFERENCES timelines(id) ON DELETE CASCADE
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_facts_entity ON facts(entity_id);
CREATE INDEX IF NOT EXISTS idx_facts_timeline ON facts(timeline_id);
CREATE INDEX IF NOT EXISTS idx_facts_temporal ON facts(valid_from_game_tick, valid_until_game_tick);
CREATE INDEX IF NOT EXISTS idx_entities_project ON entities(project_id);
CREATE INDEX IF NOT EXISTS idx_timelines_project ON timelines(project_id);
`;

export async function initDatabase(): Promise<Database> {
    if (db) return db;

    // Initialize SQL.js with WASM
    const SQL = await initSqlJs({
        locateFile: (file) => `https://sql.js.org/dist/${file}`
    });

    // Try to load from localStorage
    const savedData = localStorage.getItem('chronos_atlas_db');
    if (savedData) {
        const data = new Uint8Array(JSON.parse(savedData));
        db = new SQL.Database(data);
    } else {
        db = new SQL.Database();
        db.run(LOCAL_SCHEMA);
    }

    return db;
}

export function getDatabase(): Database | null {
    return db;
}

export function saveDatabase(): void {
    if (!db) return;
    const data = db.export();
    localStorage.setItem('chronos_atlas_db', JSON.stringify(Array.from(data)));
}

// Generate UUID
export function generateUUID(): string {
    return crypto.randomUUID();
}

// Entity operations
export interface Entity {
    id: string;
    type: 'actor' | 'location' | 'item' | 'rule';
    project_id: string;
    created_at?: string;
    updated_at?: string;
}

export function getEntities(projectId: string): Entity[] {
    if (!db) return [];
    const result = db.exec(`SELECT * FROM entities WHERE project_id = ?`, [projectId]);
    if (!result.length) return [];

    return result[0].values.map((row) => ({
        id: row[0] as string,
        type: row[1] as Entity['type'],
        project_id: row[2] as string,
        created_at: row[3] as string,
        updated_at: row[4] as string,
    }));
}

export function createEntity(entity: Omit<Entity, 'id' | 'created_at' | 'updated_at'>): Entity {
    if (!db) throw new Error('Database not initialized');

    const id = generateUUID();
    db.run(
        `INSERT INTO entities (id, type, project_id) VALUES (?, ?, ?)`,
        [id, entity.type, entity.project_id]
    );
    saveDatabase();

    return { ...entity, id };
}

// Fact operations
export interface Fact {
    id: string;
    entity_id: string;
    attribute: string;
    value: unknown;
    valid_from_game_tick: number | null;
    valid_until_game_tick: number | null;
    timeline_id: string;
}

export function getFacts(entityId: string, timelineId: string, gameTick: number): Fact[] {
    if (!db) return [];

    const result = db.exec(`
    SELECT DISTINCT id, entity_id, attribute, value, valid_from_game_tick, valid_until_game_tick, timeline_id
    FROM facts
    WHERE entity_id = ?
      AND timeline_id = ?
      AND valid_from_game_tick <= ?
      AND (valid_until_game_tick IS NULL OR valid_until_game_tick > ?)
    ORDER BY attribute, valid_from_game_tick DESC
  `, [entityId, timelineId, gameTick, gameTick]);

    if (!result.length) return [];

    return result[0].values.map((row) => ({
        id: row[0] as string,
        entity_id: row[1] as string,
        attribute: row[2] as string,
        value: JSON.parse(row[3] as string),
        valid_from_game_tick: row[4] as number | null,
        valid_until_game_tick: row[5] as number | null,
        timeline_id: row[6] as string,
    }));
}

export function createFact(fact: Omit<Fact, 'id'>): Fact {
    if (!db) throw new Error('Database not initialized');

    const id = generateUUID();
    db.run(
        `INSERT INTO facts (id, entity_id, attribute, value, valid_from_game_tick, valid_until_game_tick, timeline_id)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [id, fact.entity_id, fact.attribute, JSON.stringify(fact.value), fact.valid_from_game_tick, fact.valid_until_game_tick, fact.timeline_id]
    );
    saveDatabase();

    return { ...fact, id };
}

// Timeline operations
export interface Timeline {
    id: string;
    name: string;
    parent_id: string | null;
    is_divergent: boolean;
    project_id: string;
}

export function getTimelines(projectId: string): Timeline[] {
    if (!db) return [];

    const result = db.exec(`SELECT * FROM timelines WHERE project_id = ?`, [projectId]);
    if (!result.length) return [];

    return result[0].values.map((row) => ({
        id: row[0] as string,
        name: row[1] as string,
        parent_id: row[2] as string | null,
        is_divergent: Boolean(row[3]),
        project_id: row[4] as string,
    }));
}

export function createTimeline(timeline: Omit<Timeline, 'id'>): Timeline {
    if (!db) throw new Error('Database not initialized');

    const id = generateUUID();
    db.run(
        `INSERT INTO timelines (id, name, parent_id, is_divergent, project_id) VALUES (?, ?, ?, ?, ?)`,
        [id, timeline.name, timeline.parent_id, timeline.is_divergent ? 1 : 0, timeline.project_id]
    );
    saveDatabase();

    return { ...timeline, id };
}
