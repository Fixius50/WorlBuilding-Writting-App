package com.worldbuilding;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.StandardCopyOption;
import java.util.ArrayList;

public class MenuInicialLog {

    private static final String BASE_GENERAL = "/data/worldbuilding.db"; // base dentro de resources
    private static final String PROYECTOS_DIR = "data"; // ruta relativa
    public static ArrayList<ProyectoSeleccionado> numeroProyecto = new ArrayList<>();

    public static ProyectoSeleccionado crearProyecto(String nombreProyecto, String tipoProyecto) throws IOException {
        // Crear carpeta del proyecto si no existe
        File carpeta = new File(PROYECTOS_DIR + "/" + nombreProyecto);
        if (!carpeta.exists() && !carpeta.mkdirs()) {
            throw new IOException("No se pudo crear el directorio del proyecto.");
        }

        // Copiar base general
        File destino = new File(carpeta, "proyecto.db");
        try (InputStream base = MenuInicialLog.class.getResourceAsStream(BASE_GENERAL)) {
            if (base == null) throw new IOException("Base general no encontrada.");
            Files.copy(base, destino.toPath(), StandardCopyOption.REPLACE_EXISTING);
        }

        // Crear el conector y el proyecto
        SQLiteConnector conector = new SQLiteConnector(nombreProyecto);
        ProyectoSeleccionado proyecto = new ProyectoSeleccionado(nombreProyecto, tipoProyecto, destino, conector);
        numeroProyecto.add(proyecto);
        return proyecto;
    }

    public static boolean existeProyecto(String nombreProyecto) {
        return numeroProyecto.stream()
                .anyMatch(p -> p.getNombreProyecto().equals(nombreProyecto));
    }
}
