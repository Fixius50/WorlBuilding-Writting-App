use tauri::Manager;

mod db;
mod commands;
#[tauri::command]
fn saludar(nombre: &str) -> String {
  format!("¡Hola {}, bienvenido a Chronos Atlas desde Rust nativo!", nombre)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .invoke_handler(tauri::generate_handler![
        saludar,
        commands::proyectos::get_proyectos,
        commands::proyectos::create_proyecto
    ])
    .setup(|app| {
      // Iniciar la base de datos
      let conn = db::init(&app.handle()).expect("Fallo al inicializar la base de datos local SQLite");
      app.manage(db::DbState { conn: std::sync::Mutex::new(conn) });

      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      }
      Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
