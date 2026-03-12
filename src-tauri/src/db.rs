use rusqlite::Connection;
use std::sync::Mutex;
use tauri::{AppHandle, Manager};
use std::fs;

pub struct DbState {
    pub conn: Mutex<Connection>,
}

pub fn init(app: &AppHandle) -> Result<Connection, rusqlite::Error> {
    // Obtenemos la ruta de datos de la aplicación. En Windows usaremos LocalData o Temp como fallback seguro
    let mut app_dir = app.path().app_local_data_dir().unwrap_or_else(|_| std::env::temp_dir().join("chronos_atlas"));
    
    if !app_dir.exists() {
        if let Err(e) = fs::create_dir_all(&app_dir) {
            println!("Aviso: No se pudo crear el directorio de datos primario: {}. Usando Temp.", e);
            app_dir = std::env::temp_dir().join("chronos_atlas");
            fs::create_dir_all(&app_dir).unwrap_or_default();
        }
    }

    let db_path = app_dir.join("chronos_atlas.db");
    println!("Ruta de la Base de Datos SQLite: {:?}", db_path);
    let conn = Connection::open(db_path)?;

    // Crear tablas núcleo
    conn.execute(
        "CREATE TABLE IF NOT EXISTS proyectos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT UNIQUE NOT NULL,
            title TEXT NOT NULL,
            tag TEXT,
            image_url TEXT,
            last_modified TEXT,
            initials TEXT
        )",
        [],
    )?;

    conn.execute(
        "CREATE TABLE IF NOT EXISTS entidades (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            tipo_entidad TEXT NOT NULL,
            project_id TEXT,
            description TEXT,
            image_url TEXT,
            is_favorite BOOLEAN DEFAULT 0,
            tags TEXT,
            attributes TEXT,
            created_at TEXT
        )",
        [],
    )?;

    conn.execute(
        "CREATE TABLE IF NOT EXISTS eventos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            project_id TEXT,
            line_id TEXT,
            start_date TEXT,
            end_date TEXT,
            description TEXT,
            importance INTEGER DEFAULT 1,
            color TEXT,
            related_entities TEXT
        )",
        [],
    )?;

    conn.execute(
        "CREATE TABLE IF NOT EXISTS lenguas (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            project_id TEXT,
            description TEXT,
            phonetics TEXT,
            grammar TEXT
        )",
        [],
    )?;

    conn.execute(
        "CREATE TABLE IF NOT EXISTS carpetas (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre TEXT NOT NULL,
            project_id TEXT,
            padre_id INTEGER,
            tipo TEXT DEFAULT 'FOLDER',
            slug TEXT
        )",
        [],
    )?;

    conn.execute(
        "CREATE TABLE IF NOT EXISTS plantillas (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre TEXT NOT NULL,
            project_id TEXT,
            tipo TEXT DEFAULT 'text',
            global INTEGER DEFAULT 0,
            carpeta_id INTEGER
        )",
        [],
    )?;

    Ok(conn)
}
