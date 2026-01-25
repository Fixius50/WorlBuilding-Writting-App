-- V2__Add_Relacion.sql
CREATE TABLE IF NOT EXISTS relacion (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nodo_origen_id INTEGER NOT NULL,
    nodo_destino_id INTEGER NOT NULL,
    tipo_relacion VARCHAR(50),
    tipo_origen VARCHAR(50),
    tipo_destino VARCHAR(50),
    descripcion TEXT,
    metadata TEXT
);
