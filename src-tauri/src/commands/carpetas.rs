use rusqlite::params;
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct Carpeta {
    pub id: Option<i32>,
    pub nombre: String,
    pub project_id: Option<String>,
    pub padre_id: Option<i32>,
    pub tipo: Option<String>,
    pub slug: Option<String>,
}

#[tauri::command]
pub fn get_carpetas(state: tauri::State<'_, crate::db::DbState>, project_id: Option<String>) -> Result<Vec<Carpeta>, String> {
    let conn = state.conn.lock().map_err(|e| e.to_string())?;
    let mut query = "SELECT id, nombre, project_id, padre_id, tipo, slug FROM carpetas WHERE 1=1".to_string();
    let mut params_vec: Vec<String> = Vec::new();

    if let Some(pid) = &project_id {
        query.push_str(" AND project_id = ?");
        params_vec.push(pid.clone());
    }

    let params_ref: Vec<&dyn rusqlite::ToSql> = params_vec.iter().map(|s| s as &dyn rusqlite::ToSql).collect();
    let mut stmt = conn.prepare(&query).map_err(|e| e.to_string())?;

    let iter = stmt.query_map(&params_ref[..], |row| {
        Ok(Carpeta {
            id: row.get(0)?,
            nombre: row.get(1)?,
            project_id: row.get(2)?,
            padre_id: row.get(3)?,
            tipo: row.get(4)?,
            slug: row.get(5)?,
        })
    }).map_err(|e| e.to_string())?;

    let mut carpetas = Vec::new();
    for item in iter {
        carpetas.push(item.map_err(|e| e.to_string())?);
    }
    Ok(carpetas)
}

#[tauri::command]
pub fn create_carpeta(
    state: tauri::State<'_, crate::db::DbState>,
    nombre: String,
    project_id: Option<String>,
    padre_id: Option<i32>,
    tipo: Option<String>,
) -> Result<Carpeta, String> {
    let conn = state.conn.lock().map_err(|e| e.to_string())?;
    let tipo_str = tipo.clone().unwrap_or_else(|| "FOLDER".to_string());
    // slug = nombre slugificado
    let slug = nombre.to_lowercase()
        .chars()
        .map(|c| if c.is_alphanumeric() { c } else { '-' })
        .collect::<String>();

    conn.execute(
        "INSERT INTO carpetas (nombre, project_id, padre_id, tipo, slug) VALUES (?1, ?2, ?3, ?4, ?5)",
        params![nombre, project_id, padre_id, tipo_str, slug],
    ).map_err(|e| e.to_string())?;

    let id = conn.last_insert_rowid() as i32;
    Ok(Carpeta { id: Some(id), nombre, project_id, padre_id, tipo, slug: Some(slug) })
}

#[tauri::command]
pub fn update_carpeta(state: tauri::State<'_, crate::db::DbState>, id: i32, nombre: String) -> Result<bool, String> {
    let conn = state.conn.lock().map_err(|e| e.to_string())?;
    conn.execute("UPDATE carpetas SET nombre = ?1 WHERE id = ?2", params![nombre, id])
        .map(|_| true).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn delete_carpeta(state: tauri::State<'_, crate::db::DbState>, id: i32) -> Result<bool, String> {
    let conn = state.conn.lock().map_err(|e| e.to_string())?;
    conn.execute("DELETE FROM carpetas WHERE id = ?1", params![id])
        .map(|_| true).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_carpeta_by_slug(state: tauri::State<'_, crate::db::DbState>, slug: String) -> Result<Carpeta, String> {
    let conn = state.conn.lock().map_err(|e| e.to_string())?;
    let mut stmt = conn.prepare("SELECT id, nombre, project_id, padre_id, tipo, slug FROM carpetas WHERE slug = ?1 OR id = ?1").map_err(|e| e.to_string())?;
    let mut iter = stmt.query_map(params![slug], |row| {
        Ok(Carpeta {
            id: row.get(0)?,
            nombre: row.get(1)?,
            project_id: row.get(2)?,
            padre_id: row.get(3)?,
            tipo: row.get(4)?,
            slug: row.get(5)?,
        })
    }).map_err(|e| e.to_string())?;

    if let Some(c) = iter.next() {
        return c.map_err(|e| e.to_string());
    }
    Err("Carpeta not found".to_string())
}
