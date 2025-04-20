package com.worldbuilding;

import java.io.File;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;

import javafx.application.Platform;


/*
 * Clase dedicada al primer archivo html, el del menú inicial para iniciar un proyecto, crearlo, o cerrar el programa
 */
public class MenuInicialLog {

    // métodos

    /*
     * Crea el proyecto
     */
    public void crearProyectoNuevo(String nombreproyecto, String tipoProyecto) throws IOException {
        /* Si corres tu programa desde un IDE, el working directory suele ser el directorio raíz del proyecto
        (donde está src, build.gradle, etc).*/

        File rutaCarpeta = new File("../../../users/" + nombreproyecto);
        File subCarpeta1 = new File(rutaCarpeta + "/xml");
        File subCarpeta2 = new File(rutaCarpeta + "/json");
        File subCarpeta3 = new File(rutaCarpeta + "/sql");
        File[] subCarpetas = {subCarpeta1, subCarpeta2, subCarpeta3};
        File infoArchivo = new File(rutaCarpeta, "infoProyecto.txt");
        String descripcion = "Nombre del proyecto: " + nombreproyecto + "\nTipo de proyecto: " + tipoProyecto + "\n\nDISFRUTA DE LA ESCRITURA DE TU WORLBUILDING.\n\nPd: no borres esta carpeta";
        if (!rutaCarpeta.exists()){
            rutaCarpeta.mkdir();
            for (File file : subCarpetas) {
                file.mkdir();
            }
            try{
                FileWriter writer1 = new FileWriter(infoArchivo);
                writer1.write(descripcion);
            } catch (IOException e) {
                throw new IOException(e);
            }
        }
    }

    /*
     * Este método abre el proyecto
     */
    public void abreProyecto(String nombreproyecto) throws IOException{
        File rutaCarpeta = new File("../../../users/" + nombreproyecto);
        if (rutaCarpeta.exists()){
            try{
                FileReader reader = new FileReader(rutaCarpeta);
                reader.read();
            } catch (IOException e){
                throw new IOException(e);
            }
        }
    }

    /*
     * Este método indica que se quiere cerrar el programa que se haya pasado por JavaScript
     */
    public void cerrarPrograma() {
        System.out.println("Saliendo del programa...");
        Platform.exit();  // Esto termina la aplicación sin mostrar nada en la consola
    }

    // Constructor de la clase

    public MenuInicialLog(){} // Debe estar así para que reciba los datos

}