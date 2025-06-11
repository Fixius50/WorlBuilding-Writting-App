package com.worldbuilding;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.function.Consumer; // Importar para los callbacks

public class MenuInicialLog {

    public static ArrayList<ProyectoSeleccionado> numeroProyecto = new ArrayList<>(); // Almacena proyectos en memoria

    /**
     * Crea un nuevo proyecto en el sistema de archivos y en memoria.
     * @param nombreProyecto El nombre del nuevo proyecto.
     * @param tipoProyecto El tipo o enfoque del proyecto.
     * @return El objeto ProyectoSeleccionado creado.
     * @throws IOException Si ocurre un error de E/S.
     * @throws SQLException Si ocurre un error de base de datos.
     */
    public static ProyectoSeleccionado crearProyecto(String nombreProyecto, String tipoProyecto) throws IOException, SQLException {
        Path proyectoDir = SQLiteConnector.getProjectsDirPath().resolve(nombreProyecto);
        Path destinoDb = SQLiteConnector.getProjectDbFilePath(nombreProyecto);

        Files.createDirectories(proyectoDir); // Crea la carpeta del proyecto
        
        // Copia la base de datos plantilla al nuevo proyecto
        // Asegúrate de que SQLiteConnector.copyGeneralDatabaseTemplateIfNeeded() se haya llamado al inicio de la app.
        Files.copy(SQLiteConnector.getGeneralDbFilePath(), destinoDb, StandardCopyOption.REPLACE_EXISTING);
        System.out.println("Base de datos del proyecto copiada a: " + destinoDb);

        SQLiteConnector conector = new SQLiteConnector(nombreProyecto); // Conecta con la nueva BD del proyecto
        ProyectoSeleccionado proyecto = new ProyectoSeleccionado(nombreProyecto, tipoProyecto, proyectoDir.toFile(), conector);
        numeroProyecto.add(proyecto); // Añade el proyecto a la lista en memoria
        return proyecto;
    }

    /**
     * Verifica si un proyecto existe (en memoria o en disco).
     * Si existe en disco pero no en memoria, lo añade a la lista 'numeroProyecto'.
     * @param nombreProyecto El nombre del proyecto a verificar.
     * @return true si el proyecto existe y está cargado en memoria, false en caso contrario.
     */
    public static boolean existeProyecto(String nombreProyecto) {
        // Primero, verifica si el proyecto ya está en la lista en memoria
        boolean existeEnMemoria = numeroProyecto.stream()
                                            .anyMatch(p -> p.getNombreProyecto().equals(nombreProyecto));
        if (existeEnMemoria) {
            System.out.println("Proyecto '" + nombreProyecto + "' ya está en memoria.");
            return true;
        }

        // Si no está en memoria, verifica si existe en el sistema de archivos
        Path proyectoDir;
        try {
            proyectoDir = SQLiteConnector.getProjectsDirPath().resolve(nombreProyecto);
        } catch (IOException e) {
            System.err.println("Error al obtener la ruta del directorio de proyectos: " + e.getMessage());
            return false; // No se puede verificar si la ruta base es inaccesible
        }
        
        if (Files.exists(proyectoDir) && Files.isDirectory(proyectoDir)) {
            // Opcional: Cargar el proyecto desde disco si no está en memoria
            // Para esto, necesitarías una forma de obtener el 'tipoProyecto'
            System.out.println("Proyecto '" + nombreProyecto + "' encontrado en disco. Cargando en memoria...");
            try {
                // Suponiendo un tipo por defecto o implementando una lectura de metadatos del proyecto
                // Por ahora, para simplemente "cargarlo" en la lista, asumimos un tipo genérico.
                // En una app real, leerías esto de un archivo de config del proyecto o de su BD.
                String tipoProyecto = "Desconocido"; // Necesitas implementar cómo obtener este tipo
                SQLiteConnector conector = new SQLiteConnector(nombreProyecto);
                ProyectoSeleccionado proyectoCargado = new ProyectoSeleccionado(nombreProyecto, tipoProyecto, proyectoDir.toFile(), conector);
                numeroProyecto.add(proyectoCargado);
                return true;
            } catch (IOException | SQLException e) {
                System.err.println("Error al cargar proyecto '" + nombreProyecto + "' desde disco: " + e.getMessage());
                return false;
            }
        }
        return false; // No existe ni en memoria ni en disco
    }

    /**
     * Lógica para crear un nuevo proyecto, llamada desde la UI (Main).
     * Realiza la creación y luego solicita el cambio de escena o muestra alertas.
     * @param nombreProyecto Nombre del proyecto.
     * @param enfoqueProyecto Enfoque del proyecto.
     * @param sceneChangeCallback Callback para solicitar cambio de escena.
     * @param showAlertCallback Callback para mostrar alertas JavaScript.
     */
    public static void crearProyectoNuevoDesdeUI(String nombreProyecto, String enfoqueProyecto,
                                                 Consumer<String> sceneChangeCallback,
                                                 Consumer<String> showAlertCallback) {
        try {
            crearProyecto(nombreProyecto, enfoqueProyecto); // Lógica de negocio
            System.out.println("Proyecto creado y listo para UI.");
            sceneChangeCallback.accept("ventanaProyectos.html"); // Solicita cambio de escena
        } catch (IOException | SQLException e) {
            e.printStackTrace();
            showAlertCallback.accept("Error al crear el proyecto: " + e.getMessage());
        }
    }

    /**
     * Lógica para abrir un proyecto existente, llamada desde la UI (Main).
     * Realiza la verificación y luego solicita el cambio de escena o muestra alertas.
     * @param nombreProyecto Nombre del proyecto a abrir.
     * @param sceneChangeCallback Callback para solicitar cambio de escena.
     * @param showAlertCallback Callback para mostrar alertas JavaScript.
     */
    public static void abreProyectoDesdeUI(String nombreProyecto,
                                           Consumer<String> sceneChangeCallback,
                                           Consumer<String> showAlertCallback) {
        if (existeProyecto(nombreProyecto)) { // Lógica de negocio
            System.out.println("Proyecto existente y listo para UI.");
            sceneChangeCallback.accept("ventanaProyectos.html"); // Solicita cambio de escena
        } else {
            System.err.println("No existe el proyecto: " + nombreProyecto);
            showAlertCallback.accept("El proyecto '" + nombreProyecto + "' no existe. Por favor, créalo o verifica el nombre.");
        }
    }
}