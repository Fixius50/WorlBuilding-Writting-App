package com.worldbuilding;

import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.sql.SQLException;
import java.util.ArrayList;

import javafx.scene.web.WebEngine;
import javafx.scene.web.WebView;
/**
 * Esta clase se encarga de controlar el entorno de la pantalla del Login del usuario nada más arrancar la app.
 */
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
    public static void crearProyecto(String nombreProyecto, String tipoProyecto) throws IOException {
        // Crea el directorio donde se va a guardar la base de datos
        File carpetaProyecto = new File("src/main/resources/data/" + nombreProyecto);
        // Crea su base de datos
        File bdProyecto = new File(carpetaProyecto.getParent() + nombreProyecto + ".db");
        SQLiteConnector sqNuevo = new SQLiteConnector(nombreProyecto, tipoProyecto, bdProyecto);
        if (!existeProyecto(carpetaProyecto)) { // Lo lógico es pensar que si no existe de primeras la carpeta, no existe lo de dentro
            try {
                carpetaProyecto.mkdir(); // Se crea la carpeta
                FileWriter writer = new FileWriter(carpetaProyecto);
                writer.write(bdProyecto.toString()); // Escribe la base de datos dentro de esa carpeta
                writer.close();
            } catch (IOException e) {
                throw new IOException("Error de directorio: " + e.getMessage());
            }finally{
                System.out.println("Base de datos del proyecto copiada a: " + carpetaProyecto + "\nProyecto totalmente creado y listo para usarse en " + carpetaProyecto.toURI().toString());
                ProyectoSeleccionado proyecto = new ProyectoSeleccionado(nombreProyecto, tipoProyecto, carpetaProyecto, sqNuevo);
                numeroProyecto.add(proyecto); // Añade el proyecto a la lista en memoria
            }
        } else{
            System.out.println("El proyecto ya existe.");
        }
    }

    /**
     * Abre el proyecto bajo un nombre específico
     * @param webView
     * @param nombreProyecto
     */
    public static void abrirProyecto(WebView webView, String nombreProyecto){ // Done
        WebEngine webEngine = webView.getEngine();
        File carpetaProyecto = new File("src/main/resources/data/" + nombreProyecto);
        if (existeProyecto(carpetaProyecto)) {
            webEngine.load(nombreProyecto);   
        }
    }

    /**
     * Verifica si un proyecto existe (en memoria o en disco).
     * Si existe en disco pero no en memoria, lo añade a la lista 'numeroProyecto'.
     * @param nombreProyecto El nombre del proyecto a verificar.
     * @return true si el proyecto existe y está cargado en memoria, false en caso contrario.
     */
    public static boolean existeProyecto(File carpetaProyecto){ // Me falta verificar los datos internos
        return carpetaProyecto.isDirectory() && carpetaProyecto.exists();
    }
}