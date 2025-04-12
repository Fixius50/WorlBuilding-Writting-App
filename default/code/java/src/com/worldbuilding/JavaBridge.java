package com.worldbuilding;
import java.io.*;

import javafx.stage.DirectoryChooser;
import javafx.stage.Stage;

// --- NUEVO: Clase puente para recibir datos desde JS y guardar JSON ---
public class JavaBridge {
    private Stage stage;

    public JavaBridge(Stage stage) {
        this.stage = stage;
    }

    public void crearProyecto(String nombre, String tipo) {
        // Abre un selector de directorios
        DirectoryChooser directoryChooser = new DirectoryChooser();
        directoryChooser.setTitle("Seleccionar directorio para guardar el proyecto");
        File selectedDirectory = directoryChooser.showDialog(stage);

        if (selectedDirectory != null) {
            File jsonFile = new File(selectedDirectory, nombre + ".json");
            try (FileWriter writer = new FileWriter(jsonFile)) {
                String contenidoJson = String.format(
                    "{\n  \"nombre\": \"%s\",\n  \"tipo\": \"%s\",\n  \"ruta\": \"%s\"\n}",
                    nombre, tipo, selectedDirectory.getAbsolutePath()
                );
                writer.write(contenidoJson);
                System.out.println("Proyecto guardado en: " + jsonFile.getAbsolutePath());
            } catch (IOException e) {
                e.printStackTrace();
            }
        } else {
            System.out.println("Directorio no seleccionado.");
        }
    }
}
// --- FIN NUEVO ---