package com.worldbuilding;
import java.io.*;
import java.nio.file.*;

public class SQLiteConnector {
    private String dbPath;
    private String generalDbPath;

    private String getGeneralDbPath() {
        Path generalDb = Paths.get(System.getProperty("user.home"), ".worldbuildingapp", "worldbuilding.db");
        return generalDb.toString();
    }

    public String getDbPath() {
        return dbPath;
    }

    // Métodos generales

    public SQLiteConnector(String dbPath) throws IOException {
        // Copiar base general desde recursos a disco si no existe
        copyGeneralDatabaseIfNeeded();
        this.generalDbPath = getGeneralDbPath();
        this.dbPath = dbPath;
    }

    private void copyGeneralDatabaseIfNeeded() throws IOException {
        Path targetDir = Paths.get(System.getProperty("user.home"), ".worldbuildingapp");
        if (!Files.exists(targetDir)) {
            Files.createDirectories(targetDir);
        }
        Path generalDb = targetDir.resolve("worldbuilding.db");

        if (!Files.exists(generalDb)) {
            try (InputStream is = getClass().getResourceAsStream("/data/worldbuilding.db")) {
                if (is == null) throw new FileNotFoundException("No se encontró la base general en recursos.");
                Files.copy(is, generalDb, StandardCopyOption.REPLACE_EXISTING);
            }
        }
    }

    // Crear proyecto con base de datos propia
    public void crearProyecto(String nombreProyecto) throws IOException {
        Path projectsDir = Paths.get(System.getProperty("user.home"), ".worldbuildingapp", "projects");
        if (!Files.exists(projectsDir)) {
            Files.createDirectories(projectsDir);
        }
        Path proyectoDir = projectsDir.resolve(nombreProyecto);
        if (!Files.exists(proyectoDir)) {
            Files.createDirectories(proyectoDir);
        }
        Path proyectoDb = proyectoDir.resolve("proyecto.db");

        // Copiar base general como plantilla al nuevo proyecto
        if (!Files.exists(proyectoDb)) {
            Path generalDb = Paths.get(getGeneralDbPath());
            Files.copy(generalDb, proyectoDb, StandardCopyOption.REPLACE_EXISTING);
        }
    }

    // Cambiar a usar base de datos del proyecto
    public void usarProyecto(String nombreProyecto) {
        Path proyectoDb = Paths.get(System.getProperty("user.home"), ".worldbuildingapp", "projects", nombreProyecto, "proyecto.db");
        this.dbPath = proyectoDb.toString();
    }
}