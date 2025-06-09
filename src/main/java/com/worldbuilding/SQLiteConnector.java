package com.worldbuilding;
import java.io.*;
import java.nio.file.*;

/**
 * La clase @see SQLiteConnector lo que hace es, en principio, manejar la lógica de la base de datos del proyecto "actual".
 * Eso quiere deicr que en cuanto se cambie de proyecto, se cambia la base de datos. Para esto, se ha proporcionado una base de 
 * datos general para todas, y una propia (a la que hay que cambiarse a esta).
 * 
 * - La BD general proporciona metodos y funciones generales.
 * - La BD propia son el resto de funciones.
 * 
 * Este resto de funciones se llamarían desde aquí para insertarlas en la base de datos propia.
 * Estas bases de datos existen dentro de la carpeta "resources/data"; la general directamente y, el resto, dentro de su propia carpeta individual.
 */

public class SQLiteConnector { // Esta clase mirla y arreglarla
    private String dbPath; // La BD propia
    private String generalDbPath; // La BD general

    private String getGeneralDbPath() {
        Path generalDb = Paths.get(System.getProperty("user.home"), ".worldbuildingapp", "worldbuilding.db");
        return generalDb.toString();
    }

    public String getDbPath() {
        return dbPath;
    }

    // Constructor que inicia la base de datos

    public SQLiteConnector(String nombreProyecto) throws IOException {
        this.generalDbPath = getGeneralDbPath();
        this.dbPath = dbPath;
        // Copiar base general desde recursos a disco si no existe
        copyGeneralDatabaseIfNeeded();
        crearBDProyecto(nombreProyecto);
    }

    // Métodos generales

    private void copyGeneralDatabaseIfNeeded() throws IOException { // Arreglar y mirar
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

    // Crear tambien el metodo copyDatabaseIfNeeded

    // Crear proyecto con base de datos propia
    public void crearBDProyecto(String nombreProyecto) throws IOException { // Arreglar y mirar
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