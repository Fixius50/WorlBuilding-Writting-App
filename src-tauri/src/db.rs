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

    Ok(conn)
}
