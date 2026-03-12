use rusqlite::params;
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct Proyecto {
    pub id: Option<i32>,
    pub name: String,
    pub title: String,
    pub tag: Option<String>,
    pub image_url: Option<String>,
    pub last_modified: Option<String>,
    pub initials: Option<String>,
}

#[tauri::command]
pub fn get_proyectos(state: tauri::State<'_, crate::db::DbState>) -> Result<Vec<Proyecto>, String> {
    let conn = state.conn.lock().map_err(|e| e.to_string())?;
    
    let mut stmt = conn
        .prepare("SELECT id, name, title, tag, image_url, last_modified, initials FROM proyectos ORDER BY id DESC")
        .map_err(|e| e.to_string())?;
        
    let project_iter = stmt
        .query_map([], |row| {
            Ok(Proyecto {
                id: row.get(0)?,
                name: row.get(1)?,
                title: row.get(2)?,
                tag: row.get(3)?,
                image_url: row.get(4)?,
                last_modified: row.get(5)?,
                initials: row.get(6)?,
            })
        })
        .map_err(|e| e.to_string())?;

    let mut proyectos = Vec::new();
    for project in project_iter {
        proyectos.push(project.map_err(|e| e.to_string())?);
    }

    Ok(proyectos)
}

#[tauri::command]
pub fn create_proyecto(
    state: tauri::State<'_, crate::db::DbState>,
    name: String,
    title: String,
    tag: String,
    image_url: String,
) -> Result<Proyecto, String> {
    let conn = state.conn.lock().map_err(|e| e.to_string())?;
    
    let date = chrono::Local::now().format("%d %b %Y").to_string(); // Requiero crate chrono o lo paso fijo de momento
    let init_str = if title.len() >= 2 { title[..2].to_uppercase() } else { "XX".to_string() };

    conn.execute(
        "INSERT INTO proyectos (name, title, tag, image_url, last_modified, initials) VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
        params![name, title, tag, image_url, &date, &init_str],
    ).map_err(|e| e.to_string())?;

    let id = conn.last_insert_rowid() as i32;

    Ok(Proyecto {
        id: Some(id),
        name,
        title,
        tag: Some(tag),
        image_url: Some(image_url),
        last_modified: Some(date),
        initials: Some(init_str),
    })
}

#[tauri::command]
pub fn get_proyecto_by_name(state: tauri::State<'_, crate::db::DbState>, name: String) -> Result<Proyecto, String> {
    let conn = state.conn.lock().map_err(|e| e.to_string())?;
    
    let mut stmt = conn
        .prepare("SELECT id, name, title, tag, image_url, last_modified, initials FROM proyectos WHERE name = ?1")
        .map_err(|e| e.to_string())?;
        
    let mut iter = stmt.query_map(rusqlite::params![name], |row| {
        Ok(Proyecto {
            id: row.get(0)?,
            name: row.get(1)?,
            title: row.get(2)?,
            tag: row.get(3)?,
            image_url: row.get(4)?,
            last_modified: row.get(5)?,
            initials: row.get(6)?,
        })
    }).map_err(|e| e.to_string())?;

    if let Some(proj) = iter.next() {
        return proj.map_err(|e| e.to_string());
    }

    Err("Project not found".to_string())
}

#[tauri::command]
pub fn export_backup(app: tauri::AppHandle) -> Result<String, String> {
    use tauri::Manager;
    let app_dir = app.path().app_local_data_dir().unwrap_or_else(|_| std::env::temp_dir().join("chronos_atlas"));
    let db_path = app_dir.join("chronos_atlas.db");

    let download_dir = app.path().download_dir().map_err(|e| e.to_string())?;
    let backup_name = format!("chronos_atlas_backup_{}.db", chrono::Local::now().format("%Y%m%d_%H%M%S"));
    let dest_path = download_dir.join(backup_name);

    std::fs::copy(&db_path, &dest_path).map_err(|e| format!("Error copiando BD: {}", e))?;

    Ok(dest_path.to_string_lossy().into_owned())
}
