use rusqlite::params;
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct Lengua {
    pub id: Option<i32>,
    pub name: String,
    pub project_id: Option<String>,
    pub description: Option<String>,
    pub phonetics: Option<String>,
    pub grammar: Option<String>,
}

#[tauri::command]
pub fn get_lenguas(state: tauri::State<'_, crate::db::DbState>, project_id: Option<String>) -> Result<Vec<Lengua>, String> {
    let conn = state.conn.lock().map_err(|e| e.to_string())?;
    
    let mut query = "SELECT id, name, project_id, description, phonetics, grammar FROM lenguas WHERE 1=1".to_string();
    let mut params_vec: Vec<String> = Vec::new();

    if let Some(pid) = &project_id {
        query.push_str(" AND project_id = ?");
        params_vec.push(pid.clone());
    }
    
    query.push_str(" ORDER BY name ASC");

    let params_ref: Vec<&dyn rusqlite::ToSql> = params_vec.iter().map(|s| s as &dyn rusqlite::ToSql).collect();

    let mut stmt = conn.prepare(&query).map_err(|e| e.to_string())?;
        
    let iter = stmt
        .query_map(&params_ref[..], |row| {
            Ok(Lengua {
                id: row.get(0)?,
                name: row.get(1)?,
                project_id: row.get(2)?,
                description: row.get(3)?,
                phonetics: row.get(4)?,
                grammar: row.get(5)?,
            })
        })
        .map_err(|e| e.to_string())?;

    let mut lenguas = Vec::new();
    for l in iter {
        lenguas.push(l.map_err(|e| e.to_string())?);
    }

    Ok(lenguas)
}

#[tauri::command]
pub fn create_lengua(
    state: tauri::State<'_, crate::db::DbState>,
    name: String,
    project_id: Option<String>,
    description: Option<String>,
    phonetics: Option<String>,
    grammar: Option<String>,
) -> Result<Lengua, String> {
    let conn = state.conn.lock().map_err(|e| e.to_string())?;

    conn.execute(
        "INSERT INTO lenguas (name, project_id, description, phonetics, grammar) VALUES (?1, ?2, ?3, ?4, ?5)",
        params![name, project_id, description, phonetics, grammar],
    ).map_err(|e| e.to_string())?;

    let id = conn.last_insert_rowid() as i32;

    Ok(Lengua {
        id: Some(id),
        name,
        project_id,
        description,
        phonetics,
        grammar,
    })
}
