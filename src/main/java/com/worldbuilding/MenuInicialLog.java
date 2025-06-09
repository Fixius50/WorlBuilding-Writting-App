package com.worldbuilding;

import java.io.File;
import java.io.IOException;
import java.net.URL;
import java.nio.file.Files;
import java.nio.file.StandardCopyOption;
import java.util.ArrayList;

import javafx.application.Platform;
import javafx.scene.web.WebEngine;

public class MenuInicialLog {

    private static final String BASE_GENERAL = "/data/worldbuilding.db"; // dentro de resources
    private static final String PROYECTOS_DIR = "data"; // ruta relativa desde raíz del proyecto empaquetado
    public static ArrayList<ProyectoSeleccionado> numeroProyecto = new ArrayList<>(); // Almacena los proyectos
    private WebEngine webEngine;

    public void setWebEngine(WebEngine engine) {
        this.webEngine = engine;
    }
    
    /**
     * Crea una nueva carpeta de proyecto copiando la base general como punto de partida.
     */
    public void crearProyectoNuevo(String nombreProyecto, String tipoDeProyecto) throws IOException {

        // Crear carpeta destino y ver si existe
        File carpetaProyecto = new File(PROYECTOS_DIR + "/" + nombreProyecto);
        if (!carpetaProyecto.exists()) {
            boolean creado = carpetaProyecto.mkdirs();
            if (!creado) {
                throw new IOException("No se pudo crear el directorio del proyecto.");
            }
        }

        // Copiar la base general al nuevo proyecto
        File destino = new File(carpetaProyecto, "proyecto.db");
        try {
            var generalDB = getClass().getResourceAsStream(BASE_GENERAL);
            if (generalDB == null) throw new IOException("Base general no encontrada en resources.");

            Files.copy(generalDB, destino.toPath(), StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            throw new IOException("Error al copiar base general: " + e.getMessage());
        }

        System.out.println("Proyecto creado con base general.");
        SQLiteConnector sq = new SQLiteConnector(nombreProyecto);
        //Aquí se almacena el proyecto:
        ProyectoSeleccionado ps = new ProyectoSeleccionado(nombreProyecto, tipoDeProyecto, destino, sq);
        numeroProyecto.add(ps);

        abreProyecto(nombreProyecto);
    }

    /**
     * Abre un proyecto existente: simplemente verifica si existe la base del proyecto.
     */
    public void abreProyecto(String nombreProyecto) throws IOException{  // Abre el proyecto
        if (compruebaProyecto(nombreProyecto)) { // Si está, entonces se indica y no lanza el error
            // Cambiar HTML desde Java
            Platform.runLater(() -> {
                URL nuevaPantalla = getClass().getResource("/html/ventanaCreacion.html");
                if (nuevaPantalla != null) {
                    webEngine.load(nuevaPantalla.toExternalForm());
                }
            });
        } else{ // Si no está, entonces si que lo hace
            throw new IOException("No existe el proyecto.");
        }
    }

    public boolean compruebaProyecto(String nombreProyecto) {
        boolean estaElProyecto = false;
        for (ProyectoSeleccionado proyectoSeleccionado : numeroProyecto) {
            if (proyectoSeleccionado.getNombreProyecto().equals(nombreProyecto)) {
                estaElProyecto = true;
            }
        }
        return estaElProyecto;
    }

    public void cerrarPrograma() {
        System.out.println("Cerrando...");
        System.exit(0);
    }
}