package com.worldbuilding.app.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.sql.Statement;

/**
 * Gestiona la creación y conexión dinámica a bases de datos H2 por proyecto.
 * Cada proyecto tiene su propio archivo .mv.db en la carpeta /data.
 */
@Component
public class DatabaseManager {

    @Value("${app.data-folder:./data}")
    private String dataFolder;

    private static final String H2_URL_TEMPLATE = "jdbc:h2:file:%s;DB_CLOSE_ON_EXIT=FALSE;MODE=MySQL";
    private static final String USERNAME = "sa";
    private static final String PASSWORD = "";

    /**
     * Crea una nueva base de datos para un proyecto.
     * Inicializa las tablas y carga los procedimientos desde worldbuilding.sql
     */
    public void crearBaseDatosProyecto(String nombreProyecto) throws SQLException, IOException {
        Path dataPath = Paths.get(dataFolder);
        if (!Files.exists(dataPath)) {
            Files.createDirectories(dataPath);
        }

        String dbPath = dataPath.resolve(nombreProyecto).toAbsolutePath().toString();
        String url = String.format(H2_URL_TEMPLATE, dbPath);

        try (Connection conn = DriverManager.getConnection(url, USERNAME, PASSWORD)) {
            // Crear tablas
            ejecutarScript(conn, cargarRecurso("/schema.sql"));

            // Cargar procedimientos almacenados
            String procedimientos = cargarRecurso("/worldbuilding.sql");
            if (procedimientos != null && !procedimientos.isBlank()) {
                ejecutarScript(conn, procedimientos);
            }
        }
    }

    /**
     * Verifica si existe la base de datos de un proyecto
     */
    public boolean existeProyecto(String nombreProyecto) {
        Path dbFile = Paths.get(dataFolder, nombreProyecto + ".mv.db");
        return Files.exists(dbFile);
    }

    /**
     * Obtiene la URL JDBC para conectarse a un proyecto
     */
    public String getUrlProyecto(String nombreProyecto) {
        Path dbPath = Paths.get(dataFolder, nombreProyecto).toAbsolutePath();
        return String.format(H2_URL_TEMPLATE, dbPath.toString());
    }

    /**
     * Obtiene una conexión a la base de datos de un proyecto
     */
    public Connection getConexion(String nombreProyecto) throws SQLException {
        return DriverManager.getConnection(getUrlProyecto(nombreProyecto), USERNAME, PASSWORD);
    }

    /**
     * Lista todos los proyectos existentes (archivos .mv.db en /data)
     */
    public java.util.List<String> listarProyectos() throws IOException {
        Path dataPath = Paths.get(dataFolder);
        if (!Files.exists(dataPath)) {
            return java.util.Collections.emptyList();
        }

        return Files.list(dataPath)
                .filter(p -> p.toString().endsWith(".mv.db"))
                .map(p -> p.getFileName().toString().replace(".mv.db", ""))
                .sorted()
                .toList();
    }

    /**
     * Elimina la base de datos de un proyecto
     */
    public void eliminarProyecto(String nombreProyecto) throws IOException {
        Path dataPath = Paths.get(dataFolder);

        // H2 crea varios archivos: .mv.db y posiblemente .trace.db
        Files.list(dataPath)
                .filter(p -> p.getFileName().toString().startsWith(nombreProyecto + "."))
                .forEach(p -> {
                    try {
                        Files.deleteIfExists(p);
                    } catch (IOException e) {
                        e.printStackTrace();
                    }
                });
    }

    private void ejecutarScript(Connection conn, String script) throws SQLException {
        if (script == null || script.isBlank())
            return;

        try (Statement stmt = conn.createStatement()) {
            // H2 soporta ejecutar múltiples statements separados por ;
            for (String sql : script.split(";")) {
                String trimmed = sql.trim();
                if (!trimmed.isEmpty() && !trimmed.startsWith("--")) {
                    stmt.execute(trimmed);
                }
            }
        }
    }

    private String cargarRecurso(String path) {
        try (InputStream is = getClass().getResourceAsStream(path)) {
            if (is == null)
                return null;
            return new String(is.readAllBytes(), StandardCharsets.UTF_8);
        } catch (IOException e) {
            return null;
        }
    }
}
