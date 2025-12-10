package com.worldbuilding.app.config;

import com.zaxxer.hikari.HikariDataSource;
import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.jdbc.datasource.lookup.AbstractRoutingDataSource;

import javax.sql.DataSource;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.sql.Connection;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * DataSource dinámico que cambia de BD según el proyecto activo.
 * Usa ThreadLocal para determinar qué BD usar en cada request.
 */
@Configuration
public class DynamicDataSourceConfig {

    @Value("${app.data-folder:./data}")
    private String dataFolder;

    // ThreadLocal para almacenar el proyecto activo por thread/request
    private static final ThreadLocal<String> currentProjectHolder = new ThreadLocal<>();

    private final Map<Object, Object> targetDataSources = new ConcurrentHashMap<>();
    private AbstractRoutingDataSource routingDataSource;

    @PostConstruct
    public void init() throws IOException {
        Path dataPath = Paths.get(dataFolder);
        if (!Files.exists(dataPath)) {
            Files.createDirectories(dataPath);
        }
    }

    @Bean
    @Primary
    public DataSource dataSource() {
        // Crear BD default
        HikariDataSource defaultDs = createDataSource("default");
        initializeDatabase(defaultDs);
        targetDataSources.put("default", defaultDs);

        // Crear el RoutingDataSource
        routingDataSource = new AbstractRoutingDataSource() {
            @Override
            protected Object determineCurrentLookupKey() {
                String project = currentProjectHolder.get();
                return (project != null && !project.isBlank()) ? project : "default";
            }
        };

        routingDataSource.setTargetDataSources(targetDataSources);
        routingDataSource.setDefaultTargetDataSource(defaultDs);
        routingDataSource.afterPropertiesSet();

        return routingDataSource;
    }

    /**
     * Establece el proyecto activo para el thread actual.
     * Debe llamarse al inicio de cada request que necesite usar una BD de proyecto.
     */
    public static void setCurrentProject(String projectName) {
        if (projectName == null || projectName.isBlank()) {
            currentProjectHolder.remove();
        } else {
            currentProjectHolder.set(projectName);
        }
    }

    /**
     * Obtiene el proyecto activo del thread actual
     */
    public static String getCurrentProject() {
        return currentProjectHolder.get();
    }

    /**
     * Limpia el proyecto del thread actual
     */
    public static void clearCurrentProject() {
        currentProjectHolder.remove();
    }

    /**
     * Cambia al DataSource del proyecto especificado.
     * Crea la BD si no existe.
     */
    public synchronized void switchToProject(String projectName) {
        if (projectName == null || projectName.isBlank()) {
            projectName = "default";
        }

        if (!targetDataSources.containsKey(projectName)) {
            HikariDataSource newDs = createDataSource(projectName);
            initializeDatabase(newDs);
            targetDataSources.put(projectName, newDs);
            routingDataSource.setTargetDataSources(targetDataSources);
            routingDataSource.afterPropertiesSet();
        }

        setCurrentProject(projectName);
    }

    /**
     * Verifica si existe un proyecto
     */
    public boolean existsProject(String projectName) {
        Path dbFile = Paths.get(dataFolder, projectName + ".mv.db");
        return Files.exists(dbFile);
    }

    /**
     * Lista todos los proyectos disponibles
     */
    public java.util.List<String> listProjects() throws IOException {
        Path dataPath = Paths.get(dataFolder);
        if (!Files.exists(dataPath)) {
            return java.util.Collections.emptyList();
        }

        return Files.list(dataPath)
                .filter(p -> p.toString().endsWith(".mv.db"))
                .map(p -> p.getFileName().toString().replace(".mv.db", ""))
                .filter(name -> !name.equals("default"))
                .sorted()
                .toList();
    }

    /**
     * Elimina un proyecto
     */
    public void deleteProject(String projectName) throws IOException {
        // Cerrar DataSource si está abierto
        Object ds = targetDataSources.remove(projectName);
        if (ds instanceof HikariDataSource hikari && !hikari.isClosed()) {
            hikari.close();
        }

        // Actualizar routing
        if (routingDataSource != null) {
            routingDataSource.setTargetDataSources(targetDataSources);
            routingDataSource.afterPropertiesSet();
        }

        // Eliminar archivos
        Path dataPath = Paths.get(dataFolder);
        Files.list(dataPath)
                .filter(p -> p.getFileName().toString().startsWith(projectName + "."))
                .forEach(p -> {
                    try {
                        Files.deleteIfExists(p);
                    } catch (IOException e) {
                        e.printStackTrace();
                    }
                });

        // Si era el proyecto actual, volver al default
        if (projectName.equals(getCurrentProject())) {
            setCurrentProject("default");
        }
    }

    private HikariDataSource createDataSource(String projectName) {
        HikariDataSource ds = new HikariDataSource();
        String dbPath = Paths.get(dataFolder, projectName).toAbsolutePath().toString();

        ds.setJdbcUrl("jdbc:h2:file:" + dbPath + ";DB_CLOSE_DELAY=-1;MODE=MySQL;AUTO_SERVER=TRUE");
        ds.setUsername("sa");
        ds.setPassword("");
        ds.setDriverClassName("org.h2.Driver");
        ds.setMaximumPoolSize(5);
        ds.setMinimumIdle(1);
        ds.setPoolName("HikariPool-" + projectName);

        return ds;
    }

    private void initializeDatabase(HikariDataSource dataSource) {
        String schema = loadResource("/schema.sql");
        if (schema == null || schema.isBlank()) {
            System.err.println("WARNING: schema.sql no encontrado o vacío!");
            return;
        }

        System.out.println("Inicializando base de datos con schema.sql (" + schema.length() + " chars)");

        try (Connection conn = dataSource.getConnection();
                Statement stmt = conn.createStatement()) {

            for (String sql : schema.split(";")) {
                String trimmed = sql.trim();
                if (!trimmed.isEmpty() && !trimmed.startsWith("--")) {
                    try {
                        stmt.execute(trimmed);
                        System.out.println("  OK: " + trimmed.substring(0, Math.min(50, trimmed.length())) + "...");
                    } catch (SQLException e) {
                        // Solo ignorar errores de "ya existe"
                        if (!e.getMessage().contains("already exists")) {
                            System.err.println("  ERROR SQL: " + e.getMessage());
                        }
                    }
                }
            }
            System.out.println("Base de datos inicializada correctamente");
        } catch (SQLException e) {
            System.err.println("Error initializing database: " + e.getMessage());
            e.printStackTrace();
        }
    }

    private String loadResource(String path) {
        try (InputStream is = getClass().getResourceAsStream(path)) {
            if (is == null)
                return null;
            return new String(is.readAllBytes(), StandardCharsets.UTF_8);
        } catch (IOException e) {
            return null;
        }
    }

    @PreDestroy
    public void cleanup() {
        targetDataSources.values().forEach(ds -> {
            if (ds instanceof HikariDataSource hikari && !hikari.isClosed()) {
                hikari.close();
            }
        });
    }
}
