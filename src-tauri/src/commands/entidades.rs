use rusqlite::params;
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct Entidad {
    pub id: Option<i32>,
    pub name: String,
    pub tipo_entidad: String,
    pub project_id: Option<String>,
    pub description: Option<String>,
    pub image_url: Option<String>,
    pub is_favorite: bool,
    pub tags: Option<String>,
    pub attributes: Option<String>, // JSON string
    pub created_at: Option<String>,
}

#[tauri::command]
pub fn get_entidades(state: tauri::State<'_, crate::db::DbState>, project_id: Option<String>, tipo_entidad: Option<String>) -> Result<Vec<Entidad>, String> {
    let conn = state.conn.lock().map_err(|e| e.to_string())?;
    
    let mut query = "SELECT id, name, tipo_entidad, project_id, description, image_url, is_favorite, tags, attributes, created_at FROM entidades WHERE 1=1".to_string();
    let mut params_vec: Vec<String> = Vec::new();

    if let Some(pid) = &project_id {
        query.push_str(" AND project_id = ?");
        params_vec.push(pid.clone());
    }
    
    if let Some(tipo) = &tipo_entidad {
        query.push_str(format!(" AND tipo_entidad = ?{}", params_vec.len() + 1).as_str());
        params_vec.push(tipo.clone());
    }
    
    query.push_str(" ORDER BY name ASC");

    let params_ref: Vec<&dyn rusqlite::ToSql> = params_vec.iter().map(|s| s as &dyn rusqlite::ToSql).collect();

    let mut stmt = conn.prepare(&query).map_err(|e| e.to_string())?;
        
    let entity_iter = stmt
        .query_map(&params_ref[..], |row| {
            Ok(Entidad {
                id: row.get(0)?,
                name: row.get(1)?,
                tipo_entidad: row.get(2)?,
                project_id: row.get(3)?,
                description: row.get(4)?,
                image_url: row.get(5)?,
                is_favorite: row.get(6)?,
                tags: row.get(7)?,
                attributes: row.get(8)?,
                created_at: row.get(9)?,
            })
        })
        .map_err(|e| e.to_string())?;

    let mut entidades = Vec::new();
    for entity in entity_iter {
        entidades.push(entity.map_err(|e| e.to_string())?);
    }

    Ok(entidades)
}

#[tauri::command]
pub fn get_entidad_by_id(state: tauri::State<'_, crate::db::DbState>, id: i32) -> Result<Entidad, String> {
    let conn = state.conn.lock().map_err(|e| e.to_string())?;
    
    let mut stmt = conn
        .prepare("SELECT id, name, tipo_entidad, project_id, description, image_url, is_favorite, tags, attributes, created_at FROM entidades WHERE id = ?1")
        .map_err(|e| e.to_string())?;
        
    let mut entity_iter = stmt
        .query_map(params![id], |row| {
            Ok(Entidad {
                id: row.get(0)?,
                name: row.get(1)?,
                tipo_entidad: row.get(2)?,
                project_id: row.get(3)?,
                description: row.get(4)?,
                image_url: row.get(5)?,
                is_favorite: row.get(6)?,
                tags: row.get(7)?,
                attributes: row.get(8)?,
                created_at: row.get(9)?,
            })
        })
        .map_err(|e| e.to_string())?;

    if let Some(entity) = entity_iter.next() {
        return entity.map_err(|e| e.to_string());
    }

    Err("Entity not found".to_string())
}

#[tauri::command]
pub fn create_entidad(
    state: tauri::State<'_, crate::db::DbState>,
    name: String,
    tipo_entidad: String,
    project_id: Option<String>,
    description: Option<String>,
    image_url: Option<String>,
    tags: Option<String>,
    attributes: Option<String>,
) -> Result<Entidad, String> {
    let conn = state.conn.lock().map_err(|e| e.to_string())?;
    let date = chrono::Local::now().to_rfc3339();

    conn.execute(
        "INSERT INTO entidades (name, tipo_entidad, project_id, description, image_url, is_favorite, tags, attributes, created_at) VALUES (?1, ?2, ?3, ?4, ?5, 0, ?6, ?7, ?8)",
        params![name, tipo_entidad, project_id, description, image_url, tags, attributes, date],
    ).map_err(|e| e.to_string())?;

    let id = conn.last_insert_rowid() as i32;

    Ok(Entidad {
        id: Some(id),
        name,
        tipo_entidad,
        project_id,
        description,
        image_url,
        is_favorite: false,
        tags,
        attributes,
        created_at: Some(date),
    })
}

#[tauri::command]
pub fn delete_entidad(state: tauri::State<'_, crate::db::DbState>, id: i32) -> Result<bool, String> {
    let conn = state.conn.lock().map_err(|e| e.to_string())?;
    conn.execute("DELETE FROM entidades WHERE id = ?1", params![id]).map(|_| true).map_err(|e| e.to_string())
}
