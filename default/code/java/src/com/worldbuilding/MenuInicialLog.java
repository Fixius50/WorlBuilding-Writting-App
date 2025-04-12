package com.worldbuilding;
import java.io.File;
import java.io.FileWriter;
import java.io.IOException;

import javafx.application.Platform;
import javafx.stage.Stage;


/*
 * Clase dedicada al primer archivo html, el del menú inicial para iniciar un proyecto, crearlo, o cerrar el programa
 */
public class MenuInicialLog {
    
    private String nombreProyecto;
    private String directorioProyecto;
    private String tipoProyecto;
    private boolean closeRequested = false; // Variable para saber si se ha solicitado el cierre

    // Getters y setters
    
    public String getNombreProyecto() {
        return nombreProyecto;
    }

    public void setNombreProyecto(String nombreProyecto) {
        this.nombreProyecto = nombreProyecto;
    }

    public String getDirectorioProyecto() {
        return directorioProyecto;
    }

    public void setDirectorioProyecto(String directorioProyecto) {
        this.directorioProyecto = directorioProyecto;
    }

    public String getTipoProyecto() {
        return tipoProyecto;
    }

    public void setTipoProyecto(String tipoProyecto) {
        this.tipoProyecto = tipoProyecto;
    }

    public void setCloseRequest(boolean requested) {
        this.closeRequested = requested;
    }

    public boolean isCloseRequested() {
        return closeRequested;
    }

    // métodos

    /*
     * Crea el proyecto que se haya pasado por JavaScript
     */
    public void crearProyectoNuevo(Stage stage) {
        if (nombreProyecto == null || tipoProyecto == null || directorioProyecto == null) {
            System.out.println("Faltan datos para crear el proyecto.");
        } else{
            File directorio = new File(this.directorioProyecto);
            if (!directorio.exists() || !directorio.isDirectory()) {
                System.out.println("La ruta proporcionada no es un directorio válido.");
                
            } else{
                
                // Carpeta predeterminada para los proyectos
                File carpetaIntermedia = new File(directorio, "..\\users");

                // Crear "noseque/other" si no existe
                if (!carpetaIntermedia.exists()) {
                    boolean creada = carpetaIntermedia.mkdirs();
                    if (creada) {
                        System.out.println("Carpeta intermedia creada: " + carpetaIntermedia.getAbsolutePath());
                    } else {
                        System.out.println("No se pudo crear la carpeta intermedia.");
                        return;
                    }
                }

                // Crear carpeta del proyecto dentro de "users"
                File carpetaDelProyecto = new File(carpetaIntermedia, nombreProyecto);
                
                if (!carpetaDelProyecto.exists()) {
                    boolean creado = carpetaDelProyecto.mkdirs();
                    if (creado) {
                        System.out.println("Directorio del proyecto creado: " + carpetaDelProyecto.getAbsolutePath());
                    } else {
                        System.out.println("No se pudo crear el directorio del proyecto.");
                    }
                }
                // Construye el archivo JSon (base de datos)
                File jsonFile = new File(directorio, this.nombreProyecto + ".json");
                try (FileWriter writer = new FileWriter(jsonFile)) {
                    String contenidoJson = String.format(
                        "{\n  \"nombre\": \"%s\",\n  \"tipo\": \"%s\",\n  \"ruta\": \"%s\"\n}",
                        this.nombreProyecto, this.tipoProyecto, directorio.getAbsolutePath()
                    );
                    writer.write(contenidoJson);
                    System.out.println("Proyecto guardado en: " + jsonFile.getAbsolutePath());
                } catch (IOException e) {
                    e.printStackTrace();
                }
            }
        }
    }

    /*
     * Este método abre el proyecto que se haya pasado por JavaScript
     */
    public void abreProyecto(Stage stage){

    }

    /*
     * Este método indica que se quiere cerrar el programa que se haya pasado por JavaScript
     */
    public void cerrarPrograma() {
        System.out.println("Saliendo del programa...");
        closeRequested = true;
        Platform.exit();  // Esto termina la aplicación sin mostrar nada en la consola
    }

    // Constructor de la clase

    public MenuInicialLog(){} // Debe estar así para que reciba los datos

}