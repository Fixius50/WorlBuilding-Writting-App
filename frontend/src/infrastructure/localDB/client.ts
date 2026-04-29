import { SQLocal } from 'sqlocal';

// Instancia de la base de datos local
export const sqlocal = new SQLocal('worldbuilding_app.sqlite3');
export const { sql } = sqlocal;

/**
 * Inicializa el esquema de la base de datos si no existe.
 */
export async function initializeDatabase() {
 try {
 // Activar claves foráneas para que ON DELETE CASCADE funcione
 await sql`PRAGMA foreign_keys = ON`;
 
 // Tabla de Proyectos
 await sql`
 CREATE TABLE IF NOT EXISTS proyectos (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 nombre TEXT NOT NULL UNIQUE,
 descripcion TEXT,
 tag TEXT,
 image_url TEXT,
 initials TEXT,
 fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
 ultima_modificacion DATETIME DEFAULT CURRENT_TIMESTAMP
 )
 `;

 // Tabla de Carpetas (World Bible)
 await sql`
 CREATE TABLE IF NOT EXISTS carpetas (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 nombre TEXT NOT NULL,
 project_id INTEGER NOT NULL,
 padre_id INTEGER,
 tipo TEXT NOT NULL DEFAULT 'FOLDER',
 slug TEXT NOT NULL,
 borrado INTEGER DEFAULT 0,
 FOREIGN KEY (project_id) REFERENCES proyectos(id) ON DELETE CASCADE,
 FOREIGN KEY (padre_id) REFERENCES carpetas(id) ON DELETE CASCADE
 )
 `;

 // Tabla de Entidades (Personajes, Lugares, etc.)
 await sql`
 CREATE TABLE IF NOT EXISTS entidades (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 nombre TEXT NOT NULL,
 tipo TEXT NOT NULL,
 descripcion TEXT,
 contenido_json TEXT,
 project_id INTEGER NOT NULL,
 carpeta_id INTEGER,
 fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
 borrado INTEGER DEFAULT 0,
 FOREIGN KEY (project_id) REFERENCES proyectos(id) ON DELETE CASCADE,
 FOREIGN KEY (carpeta_id) REFERENCES carpetas(id) ON DELETE CASCADE
 )
 `;

 // Tabla de Plantillas (Atributos Personalizados)
 await sql`
 CREATE TABLE IF NOT EXISTS plantillas (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 nombre TEXT NOT NULL,
 tipo TEXT NOT NULL, -- text, short_text, number, date, select, etc.
 valor_defecto TEXT,
 metadata TEXT, -- JSON para opciones de select, etc.
 es_obligatorio INTEGER DEFAULT 0,
 project_id INTEGER NOT NULL,
 created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
 FOREIGN KEY (project_id) REFERENCES proyectos(id) ON DELETE CASCADE
 )
 `;

 // Tabla de Valores (Instancia de atributo en entidad)
 await sql`
 CREATE TABLE IF NOT EXISTS valores (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 entidad_id INTEGER NOT NULL,
 plantilla_id INTEGER NOT NULL,
 valor TEXT,
 updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
 FOREIGN KEY (entidad_id) REFERENCES entidades(id) ON DELETE CASCADE,
 FOREIGN KEY (plantilla_id) REFERENCES plantillas(id) ON DELETE CASCADE
 )
 `;

 // Tabla de Eventos (Timeline)
 await sql`
 CREATE TABLE IF NOT EXISTS eventos (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 titulo TEXT NOT NULL,
 descripcion TEXT,
 fecha_simulada TEXT,
 project_id INTEGER NOT NULL,
 timeline_id INTEGER,
 FOREIGN KEY (project_id) REFERENCES proyectos(id) ON DELETE CASCADE
 )
 `;

 // Tabla de Relaciones (Para el Grafo)
 await sql`
 CREATE TABLE IF NOT EXISTS relaciones (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 origen_id INTEGER NOT NULL,
 destino_id INTEGER NOT NULL,
 tipo TEXT NOT NULL, -- FAMILIAR, AMIGO, ENEMIGO, ALIADO, PERTENECE_A, etc.
 descripcion TEXT,
 project_id INTEGER NOT NULL,
 created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
 FOREIGN KEY (origen_id) REFERENCES entidades(id) ON DELETE CASCADE,
 FOREIGN KEY (destino_id) REFERENCES entidades(id) ON DELETE CASCADE,
 FOREIGN KEY (project_id) REFERENCES proyectos(id) ON DELETE CASCADE
 )
 `;

  // Tabla de Cuadernos (Estructura de Escritura)
  await sql`
  CREATE TABLE IF NOT EXISTS cuadernos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  titulo TEXT NOT NULL,
  genero TEXT,
  image_url TEXT,
  project_id INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES proyectos(id) ON DELETE CASCADE
  )
  `;

  // Tabla de Hojas (Contenido de Escritura)
  await sql`
  CREATE TABLE IF NOT EXISTS hojas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  titulo TEXT,
  contenido TEXT,
  cuaderno_id INTEGER NOT NULL,
  orden INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (cuaderno_id) REFERENCES cuadernos(id) ON DELETE CASCADE
  )
  `;

  // Tabla de Snapshots (Control de Versiones)
  await sql`
  CREATE TABLE IF NOT EXISTS hojas_snapshots (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  hoja_id INTEGER NOT NULL,
  contenido TEXT,
  fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (hoja_id) REFERENCES hojas(id) ON DELETE CASCADE
  )
  `;

  // Tabla de Configuraciones Globales (Sustituye a localStorage)
  await sql`
  CREATE TABLE IF NOT EXISTS configuraciones (
  clave TEXT PRIMARY KEY,
  valor TEXT NOT NULL,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
  `;

  // Índices para mejorar rendimiento en uniones y filtrados frecuentes
  await sql`CREATE INDEX IF NOT EXISTS idx_entidades_project_id ON entidades(project_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_entidades_carpeta_id ON entidades(carpeta_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_entidades_tipo ON entidades(tipo)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_relaciones_origen_id ON relaciones(origen_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_relaciones_destino_id ON relaciones(destino_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_relaciones_project_id ON relaciones(project_id)`;

  console.log('Database tables ensured');

  // --- MIGRACIONES MANUALES (Para tablas que ya existen pero necesitan columnas nuevas) ---
  try {
    // Añadir 'genero' a 'cuadernos' si no existe
    await sql`ALTER TABLE cuadernos ADD COLUMN genero TEXT`.catch(() => {});
    // Añadir 'image_url' a 'cuadernos' si no existe
    await sql`ALTER TABLE cuadernos ADD COLUMN image_url TEXT`.catch(() => {});
    // Añadir 'orden' a 'hojas' si no existe
    await sql`ALTER TABLE hojas ADD COLUMN orden INTEGER DEFAULT 0`.catch(() => {});
    
    // MIGRACIÓN PARA HANDLES DEL GRAFO
    await sql`ALTER TABLE relaciones ADD COLUMN origen_handle TEXT`.catch(() => {});
    await sql`ALTER TABLE relaciones ADD COLUMN destino_handle TEXT`.catch(() => {});
    
    // MIGRACIÓN PARA SOFT DELETE EN TODAS LAS TABLAS CLAVE
    await sql`ALTER TABLE carpetas ADD COLUMN borrado INTEGER DEFAULT 0`.catch(() => {});
    await sql`ALTER TABLE entidades ADD COLUMN borrado INTEGER DEFAULT 0`.catch(() => {});
    await sql`ALTER TABLE eventos ADD COLUMN borrado INTEGER DEFAULT 0`.catch(() => {});
    
    // MIGRACIÓN PARA MULTIVERSO (LÍNEAS PARALELAS)
    await sql`ALTER TABLE eventos ADD COLUMN linea_id INTEGER`.catch(() => {});
    
    // Nueva tabla para Ramas/Líneas de la Dimensión
    await sql`
      CREATE TABLE IF NOT EXISTS dimension_lineas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL,
        carpeta_id INTEGER NOT NULL,
        color TEXT,
        entidad_id INTEGER,
        FOREIGN KEY (carpeta_id) REFERENCES carpetas(id) ON DELETE CASCADE,
        FOREIGN KEY (entidad_id) REFERENCES entidades(id) ON DELETE SET NULL
      )
    `;

    // Migración para añadir entidad_id si ya existe la tabla
    await sql`ALTER TABLE dimension_lineas ADD COLUMN entidad_id INTEGER`.catch(() => {});

    // Nueva tabla para Vinculación de Entidades a Hitos
    await sql`
      CREATE TABLE IF NOT EXISTS eventos_entidades (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        evento_id INTEGER NOT NULL,
        entidad_id INTEGER NOT NULL,
        FOREIGN KEY (evento_id) REFERENCES eventos(id) ON DELETE CASCADE,
        FOREIGN KEY (entidad_id) REFERENCES entidades(id) ON DELETE CASCADE
      )
    `;

    // Nueva tabla para Pizarras (Whiteboards)
    await sql`
      CREATE TABLE IF NOT EXISTS pizarras (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        titulo TEXT NOT NULL,
        project_id INTEGER NOT NULL,
        carpeta_id INTEGER,
        nodos_json TEXT,
        aristas_json TEXT,
        viewport_json TEXT, -- Para guardar zoom y posición
        fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (project_id) REFERENCES proyectos(id) ON DELETE CASCADE
      )
    `;

    // Nueva tabla para Calendarios (Sistemas de Tiempo)
    await sql`
      CREATE TABLE IF NOT EXISTS calendarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL,
        project_id INTEGER NOT NULL,
        meses_json TEXT,
        dias_semana_json TEXT,
        fecha_inicio_json TEXT,
        borrado INTEGER DEFAULT 0,
        FOREIGN KEY (project_id) REFERENCES proyectos(id) ON DELETE CASCADE
      )
    `;

    // MIGRACIÓN PARA CORREGIR ELIMINACIÓN EN CASCADA (Cleanup de entidades huérfanas)
    // Nota: SQLite no permite alterar FKs fácilmente, así que limpiamos manualmente por ahora
    await sql`DELETE FROM entidades WHERE carpeta_id IS NULL AND project_id IS NOT NULL`.catch(() => {});
    
    console.log('Migrations completed');
  } catch (err) {
    console.warn('Migration warning (safe if columns exist):', err);
  }

  console.log('Database initialized successfully');

 } catch (error) {
 console.error('Error initializing database:', error);
 throw error;
 }
}
