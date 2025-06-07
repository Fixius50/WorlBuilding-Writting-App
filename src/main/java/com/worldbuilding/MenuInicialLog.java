package com.worldbuilding;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.StandardCopyOption;

public class MenuInicialLog {

    private static final String BASE_GENERAL = "/data/worldbuilding.db"; // dentro de resources
    private static final String PROYECTOS_DIR = "data/proyectos"; // ruta relativa desde raíz del proyecto empaquetado

    /**
     * Crea una nueva carpeta de proyecto copiando la base general como punto de partida.
     */
    public void crearProyectoNuevo(String nombre, String tipo) throws IOException {
        System.out.println("Creando proyecto: " + nombre + " (" + tipo + ")");

        // Crear carpeta destino
        File carpetaProyecto = new File(PROYECTOS_DIR + "/" + nombre);
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
            throw new IOException("Error al copiar base general: " + e.getMessage(), e);
        }

        System.out.println("Proyecto creado con base general.");
    }

    /**
     * Abre un proyecto existente: simplemente verifica si existe la base del proyecto.
     */
    public void abreProyecto(String nombreProyecto) throws IOException {
        File proyectoDB = new File(PROYECTOS_DIR + "/" + nombreProyecto + "/proyecto.db");
        if (!proyectoDB.exists()) {
            throw new IOException("La base del proyecto no existe: " + proyectoDB.getPath());
        }

        System.out.println("Proyecto listo para usarse: " + nombreProyecto);
    }

    public boolean compruebaProyecto() {
        // Aquí podrías validar si hay un proyecto activo
        return false;
    }

    public void cerrarPrograma() {
        System.out.println("Cerrando...");
    }
}