package com.worldbuilding;

import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.sql.SQLException;
import java.util.ArrayList;
/**
 * Esta clase se encarga de controlar la pantalla del Login del usuario nada más arrancar la app.
 * @see crearProyecto: se usa para generar un proyecto nuevo y guardarlo en src/main/resources/data.
 * @see abrirProyecto: se usa para abrir un proyecto guardado en src/main/resources/data.
 * @see existeProyecto: se usa para comprobar si un proyecto existe en src/main/resources/data.
 * @see existeContenido: se usa para comprobar si el contenido de un proyecto existe en src/main/resources/data/ + @param nombreCarpeta .
 */
public class MenuInicialLog {

    private static ArrayList<ProyectoSeleccionado> numeroProyecto = new ArrayList<>(); // Almacena proyectos en memoria
    private static ProyectoActual proyectoActual; // Proyecto activo

    public static void setProyectoActual(String nombre, String tipo) {
        proyectoActual = new ProyectoActual(nombre, tipo);
    }

    public static String getNombreProyecto() {
        return proyectoActual.nombre;
    }

    public static String getTipoProyecto() {
        return proyectoActual.tipo;
    }

    private static class ProyectoActual {
        String nombre;
        String tipo;

        ProyectoActual(String nombre, String tipo) {
            this.nombre = nombre;
            this.tipo = tipo;
        }
    }

    /**
     * Crea un nuevo proyecto en el proyecto.
     * @param nombreProyecto El nombre del nuevo proyecto.
     * @param tipoProyecto El tipo o enfoque del proyecto.
     * @return El objeto ProyectoSeleccionado creado.
     * @throws IOException Si ocurre un error de E/S.
     * @throws SQLException Si ocurre un error de base de datos.
     */
    public static void crearProyecto(String nombreProyecto, String tipoProyecto) throws IOException {
        // Ruta del directorio del proyecto
        File carpetaProyecto = new File("src/main/resources/data/" + nombreProyecto);

        // Si el proyecto no existe, se crea la carpeta
        if (!existeProyecto(carpetaProyecto)) {
            carpetaProyecto.mkdirs();
        }

        // Archivo de base de datos dentro de esa carpeta
        File bdProyecto = new File(carpetaProyecto, nombreProyecto + ".db");

        // Solo crea y escribe el archivo si no hay contenido
        if (!existeContenido(carpetaProyecto)) {
            try (FileWriter writer = new FileWriter(bdProyecto, true)) {
                writer.write(""); // Crea el archivo
            } catch (IOException e) {
                throw new IOException("Error creando base de datos: " + e.getMessage());
            }
        }

        // Crear conector SQLite (una vez que el archivo y carpeta existen)
        SQLiteConnector sqNuevo = new SQLiteConnector(nombreProyecto, tipoProyecto, bdProyecto);

        // Confirmación final
        System.out.println("Base de datos del proyecto copiada a: " + carpetaProyecto +
                        "\nProyecto totalmente creado y listo para usarse en " + carpetaProyecto.toURI());

        // Añade el proyecto a la lista en memoria
        ProyectoSeleccionado proyecto = new ProyectoSeleccionado(nombreProyecto, tipoProyecto, carpetaProyecto, sqNuevo);
        numeroProyecto.add(proyecto);
        setProyectoActual(nombreProyecto, tipoProyecto);
    }

    /**
     * Abre el proyecto bajo un nombre específico
     * @param webView
     * @param nombreProyecto
     */
    public static void abrirProyecto(String nombreProyecto) {
        File carpetaProyecto = new File("src/main/resources/data/" + nombreProyecto);
        if (existeProyecto(carpetaProyecto) && existeContenido(carpetaProyecto)) {
            for (ProyectoSeleccionado proyectoSeleccionado : numeroProyecto) {
                if (proyectoSeleccionado.getNombreProyecto().equals(nombreProyecto)) {
                    setProyectoActual(nombreProyecto, proyectoSeleccionado.getTipoProyecto()); // tipoProyecto debe recuperarse si lo tienes
                }
            }
            Main.getInstance().cambiarHTML("ventanaProyectos.html");
        }
    }

    /**
     * Verifica si un proyecto existe.
     * @param carpetaProyecto El nombre del proyecto a verificar.
     * @return true si el proyecto existe y está cargado en memoria, false en caso contrario.
     */
    public static boolean existeProyecto(File carpetaProyecto) {
        return carpetaProyecto.exists() && carpetaProyecto.isDirectory();
    }

    /**
     * Verifica si el contenido de un proyecto existe.
     * @param carpetaProyecto El nombre del proyecto a verificar.
     * @return true si el proyecto tiene la base de datos y contenido, false en caso contrario.
     */
    public static boolean existeContenido(File carpetaProyecto) {
        return carpetaProyecto != null 
            && carpetaProyecto.isDirectory()
            && carpetaProyecto.listFiles() != null && carpetaProyecto.listFiles().length > 0;
    }
}