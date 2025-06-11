package com.worldbuilding;

import java.io.*;
import java.net.URISyntaxException;
import java.nio.file.*;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

import org.sqlite.SQLiteConnection;

/**
 * La clase SQLiteConnector gestiona la conexión y las operaciones con la base de datos del proyecto "actual".
 * Cada proyecto tiene su propia base de datos (proyecto.db), copiada de una plantilla general (worldbuilding.db) que se usa como plantilla y para posibles funciones generales si se requiere.
 *
 * La base de datos general se almacena en data junto a las carpetas que contienen dentro sus bases de datos propias.
 */
public class SQLiteConnector {
    private SQLiteConnection connection;
    private File rutaBaseDeDatosProyecto;
    private String nombreProyecto;
    private String tipoProyecto;

    // Nombres de archivos y directorios
    private static final String DATA_DIR_NAME = "data"; // Carpeta principal para todos los datos
    private static final String PROJECTS_SUBDIR_NAME = "projects"; // Subcarpeta para proyectos
    private static final String GENERAL_DB_FILENAME = "worldbuilding.db"; // Nombre de la plantilla general

    public SQLiteConnector(String nombreProyecto, String tipoProyecto, File rutaBaseDeDatosProyecto){
        this.nombreProyecto = nombreProyecto;
        this.tipoProyecto = tipoProyecto;
        this.rutaBaseDeDatosProyecto = rutaBaseDeDatosProyecto;
         // this.connection = new SQLiteConnector(nombreProyecto, tipoProyecto, rutaBaseDeDatosProyecto); Esto mirarlo más adelante para implementarlo
    }
}