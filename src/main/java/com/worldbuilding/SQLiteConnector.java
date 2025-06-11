package com.worldbuilding;

import java.io.*;
import java.net.URISyntaxException;
import java.nio.file.*;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

/**
 * La clase SQLiteConnector gestiona la conexión y las operaciones con la base de datos del proyecto "actual".
 * Cada proyecto tiene su propia base de datos (proyecto.db), copiada de una plantilla general.
 * La BD general (worldbuilding.db) se usa como plantilla y para posibles funciones generales si se requiere.
 *
 * Todas las bases de datos (la general y las de los proyectos) se almacenan en un directorio 'data'
 * relativo al JAR ejecutable de la aplicación.
 */
public class SQLiteConnector {
    private Connection connection;
    private String currentDbPath;

    // Nombres de archivos y directorios
    private static final String DATA_DIR_NAME = "data"; // Carpeta principal para todos los datos
    private static final String PROJECTS_SUBDIR_NAME = "projects"; // Subcarpeta para proyectos
    private static final String GENERAL_DB_FILENAME = "worldbuilding.db"; // Nombre de la plantilla general
    private static final String PROJECT_DB_FILENAME = "proyecto.db"; // Nombre de la BD de cada proyecto

    /**
     * Retorna la ruta base donde se almacenarán los datos de la aplicación (relativa al JAR).
     * @return Path al directorio 'data'.
     * @throws IOException si hay un problema al obtener la ruta del JAR.
     */
    public static Path getAppBaseDirPath() throws IOException {
        try {
            // Obtener la ruta del JAR actual.
            // Si se ejecuta desde IDE, puede ser la ruta del directorio 'target/classes' o similar.
            // Si se ejecuta un JAR, será el directorio donde está el JAR.
            Path jarPath = Paths.get(SQLiteConnector.class.getProtectionDomain().getCodeSource().getLocation().toURI());
            
            // Si es un JAR, el padre es el directorio que contiene el JAR.
            // Si es desde IDE, el padre es 'target/classes' o similar, y queremos el directorio del proyecto.
            Path baseDir;
            if (Files.isRegularFile(jarPath)) { // Estamos en un JAR
                baseDir = jarPath.getParent();
            } else { // Estamos en el IDE (directorio de clases)
                // Subimos dos niveles para llegar a la raíz del proyecto (e.g., de target/classes/com/worldbuilding a proyecto_raiz)
                baseDir = jarPath.getParent().getParent().getParent(); // Ajusta según tu estructura de Maven/Gradle
            }
            
            return baseDir.resolve(DATA_DIR_NAME);
        } catch (URISyntaxException e) {
            throw new IOException("Error al obtener la ruta base de la aplicación: " + e.getMessage(), e);
        }
    }

    /**
     * Retorna la ruta del directorio donde se guardan los proyectos individuales.
     * Ejemplo: data/projects/
     * @return Path al directorio 'data/projects'.
     * @throws IOException
     */
    public static Path getProjectsDirPath() throws IOException {
        return getAppBaseDirPath().resolve(PROJECTS_SUBDIR_NAME);
    }

    /**
     * Retorna la ruta de la base de datos general (plantilla).
     * Ejemplo: data/worldbuilding.db
     * @return Path al archivo worldbuilding.db.
     * @throws IOException
     */
    public static Path getGeneralDbFilePath() throws IOException {
        return getAppBaseDirPath().resolve(GENERAL_DB_FILENAME);
    }

    /**
     * Retorna la ruta de la base de datos de un proyecto específico.
     * Ejemplo: data/projects/MiProyecto/proyecto.db
     * @param nombreProyecto El nombre del proyecto.
     * @return Path al archivo proyecto.db dentro de la carpeta del proyecto.
     * @throws IOException
     */
    public static Path getProjectDbFilePath(String nombreProyecto) throws IOException {
        return getProjectsDirPath().resolve(nombreProyecto).resolve(PROJECT_DB_FILENAME);
    }

    public String getCurrentDbPath() {
        return currentDbPath;
    }

    /**
     * Constructor para inicializar el conector y establecer la base de datos del proyecto actual.
     * Asume que la base de datos del proyecto ya ha sido copiada o creada en su lugar correcto.
     *
     * @param nombreProyecto El nombre del proyecto cuya base de datos se quiere manejar.
     * @throws IOException Si ocurre un error de E/S al verificar rutas.
     * @throws SQLException Si ocurre un error al conectar con la base de datos.
     */
    public SQLiteConnector(String nombreProyecto) throws IOException, SQLException {
        // Asegurarse de que el directorio base de la aplicación y el de proyectos existen
        Files.createDirectories(getAppBaseDirPath());
        Files.createDirectories(getProjectsDirPath());

        Path projectDbFilePath = getProjectDbFilePath(nombreProyecto);

        // Verificar si la base de datos del proyecto existe. Si no, lanzar excepción
        // porque la lógica de copia/creación debería estar en MenuInicialLog.crearProyecto
        if (!Files.exists(projectDbFilePath)) {
            throw new FileNotFoundException("La base de datos del proyecto '" + nombreProyecto + "' no se encontró en: " + projectDbFilePath);
        }

        this.currentDbPath = projectDbFilePath.toString();
        connect();
    }

    /**
     * Copia la base de datos general (plantilla) desde los recursos de la aplicación
     * al directorio 'data' si aún no existe. Este método debe ser llamado una vez
     * al inicio de la aplicación o antes de cualquier creación de proyecto.
     * @throws IOException Si ocurre un error al copiar el archivo.
     */
    public static void copyGeneralDatabaseTemplateIfNeeded() throws IOException {
        Path generalDbTarget = getGeneralDbFilePath();
        if (!Files.exists(generalDbTarget)) {
            Files.createDirectories(generalDbTarget.getParent()); // Asegurarse de que el directorio padre existe
            try (InputStream is = SQLiteConnector.class.getResourceAsStream("/data/" + GENERAL_DB_FILENAME)) {
                if (is == null) {
                    throw new FileNotFoundException("No se encontró la base de datos general en los recursos: /data/" + GENERAL_DB_FILENAME +
                                                    ". Asegúrate de que está en src/main/resources/data/");
                }
                Files.copy(is, generalDbTarget, StandardCopyOption.REPLACE_EXISTING);
                System.out.println("Plantilla de base de datos general copiada a: " + generalDbTarget);
            }
        }
    }

    private void connect() throws SQLException {
        closeConnection();
        String url = "jdbc:sqlite:" + currentDbPath;
        connection = DriverManager.getConnection(url);
        System.out.println("Conectado a la base de datos: " + currentDbPath);
    }

    public Connection getConnection() {
        return connection;
    }

    public void closeConnection() {
        if (connection != null) {
            try {
                connection.close();
                System.out.println("Conexión a la base de datos cerrada.");
            } catch (SQLException e) {
                System.err.println("Error al cerrar la conexión a la base de datos: " + e.getMessage());
            } finally {
                connection = null;
            }
        }
    }

    public void switchProjectDatabase(String nombreNuevoProyecto) throws IOException, SQLException {
        Path newProjectDbPath = getProjectDbFilePath(nombreNuevoProyecto);
        if (!Files.exists(newProjectDbPath)) {
            throw new FileNotFoundException("La base de datos para el proyecto '" + nombreNuevoProyecto + "' no existe en: " + newProjectDbPath);
        }
        this.currentDbPath = newProjectDbPath.toString();
        connect();
        System.out.println("Cambiando a la base de datos del proyecto: " + nombreNuevoProyecto);
    }

    public int executeUpdate(String sql) throws SQLException {
        if (connection == null || connection.isClosed()) {
            throw new SQLException("No hay conexión activa a la base de datos.");
        }
        try (var statement = connection.createStatement()) {
            return statement.executeUpdate(sql);
        }
    }

    public java.sql.ResultSet executeQuery(String sql) throws SQLException {
        if (connection == null || connection.isClosed()) {
            throw new SQLException("No hay conexión activa a la base de datos.");
        }
        var statement = connection.createStatement();
        return statement.executeQuery(sql);
    }
}