/**
 * Local Database v2.0 - Modelo Cosmológico
 * SQLite WASM con soporte para jerarquía de entidades y multiverso
 */

import initSqlJs, { Database } from 'sql.js';

let db: Database | null = null;

// Schema local matching Supabase Cosmological Model
const LOCAL_SCHEMA = `
-- Projects
CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Entities (Hierarchical Cosmological Model)
CREATE TABLE IF NOT EXISTS entities (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  parent_id TEXT,
  type TEXT NOT NULL CHECK (type IN (
    'universe', 'spacetime', 'galaxy', 'system', 'planet', 
    'region', 'character', 'item', 'rule'
  )),
  time_config TEXT, -- JSON stringified
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (parent_id) REFERENCES entities(id) ON DELETE CASCADE
);

-- Facts (Truth in the Multiverse)
CREATE TABLE IF NOT EXISTS facts (
  id TEXT PRIMARY KEY,
  entity_id TEXT NOT NULL,
  attribute TEXT NOT NULL,
  value TEXT NOT NULL, -- JSON stringified
  valid_from_tick INTEGER,
  valid_until_tick INTEGER,
  root_spacetime_id TEXT NOT NULL, -- The What-If key!
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (entity_id) REFERENCES entities(id) ON DELETE CASCADE,
  FOREIGN KEY (root_spacetime_id) REFERENCES entities(id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_entities_parent ON entities(parent_id);
CREATE INDEX IF NOT EXISTS idx_entities_project ON entities(project_id);
CREATE INDEX IF NOT EXISTS idx_entities_type ON entities(type);
CREATE INDEX IF NOT EXISTS idx_facts_entity ON facts(entity_id);
CREATE INDEX IF NOT EXISTS idx_facts_spacetime ON facts(root_spacetime_id);
CREATE INDEX IF NOT EXISTS idx_facts_temporal ON facts(valid_from_tick, valid_until_tick);
`;

export async function initDatabase(): Promise<Database> {
    if (db) return db;

    const SQL = await initSqlJs({
        locateFile: (file) => \`https://sql.js.org/dist/\${file}\`
  });

  const savedData = localStorage.getItem('chronos_atlas_db_v2');
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
  localStorage.setItem('chronos_atlas_db_v2', JSON.stringify(Array.from(data)));
}

export function generateUUID(): string {
  return crypto.randomUUID();
}

// ============================================
// Entity Types
// ============================================

export type EntityType = 
  | 'universe' 
  | 'spacetime' 
  | 'galaxy' 
  | 'system' 
  | 'planet' 
  | 'region' 
  | 'character' 
  | 'item' 
  | 'rule';

export interface TimeConfig {
  tick_multiplier: number;
  calendar: string;
  epoch_name?: string;
  year_length?: number;
  day_length?: number;
}

export interface Entity {
  id: string;
  project_id: string;
  parent_id: string | null;
  type: EntityType;
  time_config: TimeConfig | null;
  created_at?: string;
  updated_at?: string;
}

export interface Fact {
  id: string;
  entity_id: string;
  attribute: string;
  value: unknown;
  valid_from_tick: number | null;
  valid_until_tick: number | null;
  root_spacetime_id: string;
  created_at?: string;
}

// ============================================
// Entity Operations
// ============================================

export function getEntities(projectId: string): Entity[] {
  if (!db) return [];
  const result = db.exec(\`SELECT * FROM entities WHERE project_id = ?\`, [projectId]);
  if (!result.length) return [];
  
  return result[0].values.map((row) => ({
    id: row[0] as string,
    project_id: row[1] as string,
    parent_id: row[2] as string | null,
    type: row[3] as EntityType,
    time_config: row[4] ? JSON.parse(row[4] as string) : null,
    created_at: row[5] as string,
    updated_at: row[6] as string,
  }));
}

export function getEntityChildren(parentId: string): Entity[] {
  if (!db) return [];
  const result = db.exec(\`SELECT * FROM entities WHERE parent_id = ? ORDER BY type, created_at\`, [parentId]);
  if (!result.length) return [];
  
  return result[0].values.map((row) => ({
    id: row[0] as string,
    project_id: row[1] as string,
    parent_id: row[2] as string | null,
    type: row[3] as EntityType,
    time_config: row[4] ? JSON.parse(row[4] as string) : null,
    created_at: row[5] as string,
    updated_at: row[6] as string,
  }));
}

export function getSpacetimes(universeId: string): Entity[] {
  if (!db) return [];
  const result = db.exec(
    \`SELECT * FROM entities WHERE parent_id = ? AND type = 'spacetime' ORDER BY created_at\`,
    [universeId]
  );
  if (!result.length) return [];
  
  return result[0].values.map((row) => ({
    id: row[0] as string,
    project_id: row[1] as string,
    parent_id: row[2] as string | null,
    type: row[3] as EntityType,
    time_config: row[4] ? JSON.parse(row[4] as string) : null,
    created_at: row[5] as string,
    updated_at: row[6] as string,
  }));
}

export function createEntity(entity: Omit<Entity, 'id' | 'created_at' | 'updated_at'>): Entity {
  if (!db) throw new Error('Database not initialized');
  
  const id = generateUUID();
  db.run(
    \`INSERT INTO entities (id, project_id, parent_id, type, time_config) VALUES (?, ?, ?, ?, ?)\`,
    [id, entity.project_id, entity.parent_id, entity.type, entity.time_config ? JSON.stringify(entity.time_config) : null]
  );
  saveDatabase();
  
  return { ...entity, id };
}

// ============================================
// Fact Operations
// ============================================

export function getEntityState(entityId: string, spacetimeId: string, tick: number): Fact[] {
  if (!db) return [];
  
  const result = db.exec(\`
    SELECT * FROM facts
    WHERE entity_id = ?
      AND root_spacetime_id = ?
      AND valid_from_tick <= ?
      AND (valid_until_tick IS NULL OR valid_until_tick > ?)
    ORDER BY attribute, valid_from_tick DESC
  \`, [entityId, spacetimeId, tick, tick]);
  
  if (!result.length) return [];
  
  // Distinct on attribute (take most recent)
  const seen = new Set<string>();
  return result[0].values
    .map((row) => ({
      id: row[0] as string,
      entity_id: row[1] as string,
      attribute: row[2] as string,
      value: JSON.parse(row[3] as string),
      valid_from_tick: row[4] as number | null,
      valid_until_tick: row[5] as number | null,
      root_spacetime_id: row[6] as string,
      created_at: row[7] as string,
    }))
    .filter((fact) => {
      if (seen.has(fact.attribute)) return false;
      seen.add(fact.attribute);
      return true;
    });
}

export function createFact(fact: Omit<Fact, 'id' | 'created_at'>): Fact {
  if (!db) throw new Error('Database not initialized');
  
  const id = generateUUID();
  db.run(
    \`INSERT INTO facts (id, entity_id, attribute, value, valid_from_tick, valid_until_tick, root_spacetime_id)
     VALUES (?, ?, ?, ?, ?, ?, ?)\`,
    [id, fact.entity_id, fact.attribute, JSON.stringify(fact.value), fact.valid_from_tick, fact.valid_until_tick, fact.root_spacetime_id]
  );
  saveDatabase();
  
  return { ...fact, id };
}

// ============================================
// Project Bootstrap (Create default structure)
// ============================================

export function bootstrapProject(projectId: string, projectName: string): { universe: Entity; canon: Entity } {
  if (!db) throw new Error('Database not initialized');
  
  // Create project
  db.run(
    \`INSERT OR IGNORE INTO projects (id, name) VALUES (?, ?)\`,
    [projectId, projectName]
  );
  
  // Create Universe (root container)
  const universeId = generateUUID();
  db.run(
    \`INSERT INTO entities (id, project_id, parent_id, type, time_config) VALUES (?, ?, NULL, 'universe', NULL)\`,
    [universeId, projectId]
  );
  
  // Create Canon Spacetime (default timeline)
  const canonId = generateUUID();
  const defaultTimeConfig: TimeConfig = {
    tick_multiplier: 1.0,
    calendar: 'earth_standard',
    epoch_name: 'Year',
    year_length: 365,
    day_length: 24,
  };
  db.run(
    \`INSERT INTO entities (id, project_id, parent_id, type, time_config) VALUES (?, ?, ?, 'spacetime', ?)\`,
    [canonId, projectId, universeId, JSON.stringify(defaultTimeConfig)]
  );
  
  // Add name facts
  db.run(
    \`INSERT INTO facts (id, entity_id, attribute, value, valid_from_tick, valid_until_tick, root_spacetime_id)
     VALUES (?, ?, 'name', ?, 0, NULL, ?)\`,
    [generateUUID(), universeId, JSON.stringify({ string: 'Universe' }), canonId]
  );
  db.run(
    \`INSERT INTO facts (id, entity_id, attribute, value, valid_from_tick, valid_until_tick, root_spacetime_id)
     VALUES (?, ?, 'name', ?, 0, NULL, ?)\`,
    [generateUUID(), canonId, JSON.stringify({ string: 'Canon' }), canonId]
  );
  
  saveDatabase();
  
  return {
    universe: { id: universeId, project_id: projectId, parent_id: null, type: 'universe', time_config: null },
    canon: { id: canonId, project_id: projectId, parent_id: universeId, type: 'spacetime', time_config: defaultTimeConfig },
  };
}
