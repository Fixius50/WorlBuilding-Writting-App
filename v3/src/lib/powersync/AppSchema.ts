/**
 * PowerSync AppSchema - Modelo Cosmológico
 * Define las tablas que PowerSync sincronizará entre SQLite local y Supabase
 * 
 * NOTA: Este archivo define la estructura para cuando se integre PowerSync.
 * Por ahora sirve como referencia del esquema.
 */

// PowerSync column types (para referencia futura cuando se instale correctamente)
export type ColumnType = 'TEXT' | 'INTEGER' | 'REAL';

export interface ColumnDef {
    type: ColumnType;
    nullable?: boolean;
}

export interface TableDef {
    [columnName: string]: ColumnDef;
}

export interface SchemaDefinition {
    [tableName: string]: TableDef;
}

// Schema definition matching our local SQLite
export const AppSchemaDefinition: SchemaDefinition = {
    // 1. ENTIDADES (El Árbol Cósmico)
    entities: {
        project_id: { type: 'TEXT' },
        parent_id: { type: 'TEXT', nullable: true },
        type: { type: 'TEXT' },
        name: { type: 'TEXT' },
        time_config: { type: 'TEXT', nullable: true },
        created_at: { type: 'TEXT' }
    },

    // 2. HECHOS (La verdad temporal y dimensional)
    facts: {
        entity_id: { type: 'TEXT' },
        root_spacetime_id: { type: 'TEXT' },
        attribute: { type: 'TEXT' },
        value: { type: 'TEXT' },
        valid_from_tick: { type: 'INTEGER', nullable: true },
        valid_until_tick: { type: 'INTEGER', nullable: true }
    },

    // 3. GEOMETRÍA (Lo que pintamos en el mapa)
    map_features: {
        entity_id: { type: 'TEXT' },
        root_spacetime_id: { type: 'TEXT' },
        geom: { type: 'TEXT' },
        style: { type: 'TEXT', nullable: true }
    }
};

// Type exports for TypeScript
export interface EntitiesRecord {
    id: string;
    project_id: string;
    parent_id: string | null;
    type: string;
    name: string;
    time_config: string | null;
    created_at: string;
}

export interface FactsRecord {
    id: string;
    entity_id: string;
    root_spacetime_id: string;
    attribute: string;
    value: string;
    valid_from_tick: number | null;
    valid_until_tick: number | null;
}

export interface MapFeaturesRecord {
    id: string;
    entity_id: string;
    root_spacetime_id: string;
    geom: string;
    style: string | null;
}
