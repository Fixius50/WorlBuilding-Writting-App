use rusqlite::params;
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct Evento {
    pub id: Option<i32>,
    pub title: String,
    pub project_id: Option<String>,
    pub line_id: Option<String>,
    pub start_date: Option<String>,
    pub end_date: Option<String>,
    pub description: Option<String>,
    pub importance: Option<i32>,
    pub color: Option<String>,
    pub related_entities: Option<String>, // JSON string array
}

#[tauri::command]
pub fn get_eventos(state: tauri::State<'_, crate::db::DbState>, project_id: Option<String>, line_id: Option<String>) -> Result<Vec<Evento>, String> {
    let conn = state.conn.lock().map_err(|e| e.to_string())?;
    
    let mut query = "SELECT id, title, project_id, line_id, start_date, end_date, description, importance, color, related_entities FROM eventos WHERE 1=1".to_string();
    let mut params_vec: Vec<String> = Vec::new();

    if let Some(pid) = &project_id {
        query.push_str(" AND project_id = ?");
        params_vec.push(pid.clone());
    }
    
    if let Some(lid) = &line_id {
        query.push_str(format!(" AND line_id = ?{}", params_vec.len() + 1).as_str());
        params_vec.push(lid.clone());
    }
    
    query.push_str(" ORDER BY start_date ASC");

    let params_ref: Vec<&dyn rusqlite::ToSql> = params_vec.iter().map(|s| s as &dyn rusqlite::ToSql).collect();

    let mut stmt = conn.prepare(&query).map_err(|e| e.to_string())?;
        
    let event_iter = stmt
        .query_map(&params_ref[..], |row| {
            Ok(Evento {
                id: row.get(0)?,
                title: row.get(1)?,
                project_id: row.get(2)?,
                line_id: row.get(3)?,
                start_date: row.get(4)?,
                end_date: row.get(5)?,
                description: row.get(6)?,
                importance: row.get(7)?,
                color: row.get(8)?,
                related_entities: row.get(9)?,
            })
        })
        .map_err(|e| e.to_string())?;

    let mut eventos = Vec::new();
    for event in event_iter {
        eventos.push(event.map_err(|e| e.to_string())?);
    }

    Ok(eventos)
}

#[tauri::command]
pub fn create_evento(
    state: tauri::State<'_, crate::db::DbState>,
    title: String,
    project_id: Option<String>,
    line_id: Option<String>,
    start_date: Option<String>,
    end_date: Option<String>,
    description: Option<String>,
    importance: Option<i32>,
    color: Option<String>,
    related_entities: Option<String>,
) -> Result<Evento, String> {
    let conn = state.conn.lock().map_err(|e| e.to_string())?;

    conn.execute(
        "INSERT INTO eventos (title, project_id, line_id, start_date, end_date, description, importance, color, related_entities) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9)",
        params![title, project_id, line_id, start_date, end_date, description, importance.unwrap_or(1), color, related_entities],
    ).map_err(|e| e.to_string())?;

    let id = conn.last_insert_rowid() as i32;

    Ok(Evento {
        id: Some(id),
        title,
        project_id,
        line_id,
        start_date,
        end_date,
        description,
        importance: Some(importance.unwrap_or(1)),
        color,
        related_entities,
    })
}
