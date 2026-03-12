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
        commands::proyectos::get_proyecto_by_name,
        commands::proyectos::create_proyecto,
        commands::proyectos::export_backup,
        commands::entidades::get_entidades,
        commands::entidades::get_entidad_by_id,
        commands::entidades::create_entidad,
        commands::entidades::delete_entidad,
        commands::eventos::get_eventos,
        commands::eventos::create_evento,
        commands::lenguas::get_lenguas,
        commands::lenguas::create_lengua,
        commands::carpetas::get_carpetas,
        commands::carpetas::get_carpeta_by_slug,
        commands::carpetas::create_carpeta,
        commands::carpetas::update_carpeta,
        commands::carpetas::delete_carpeta
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
