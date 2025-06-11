package com.worldbuilding;

import javafx.application.Platform;
import java.io.IOException;

/**
 * Clase puente para llamadas JavaScript ↔ Java.
 * Este objeto se inyecta en el WebView y puede ser accedido desde JS como `window.javaConnector`.
 */
public class JavaScriptBridge {

    public interface NavigationListener {
        void onProyectoCreado();  // Se llama cuando proyecto creado para cargar nuevo HTML
    }

    private NavigationListener listener;

    public void setNavigationListener(NavigationListener listener) {
        this.listener = listener;
    }

    /**
     * Cierra la aplicación cuando se invoca desde JavaScript.
     */
    public void cerrarPrograma() {
        Platform.exit();
    }

    /**
     * Crea un nuevo proyecto con nombre y enfoque, desde JavaScript.
     * @param nombreProyecto Nombre del nuevo proyecto.
     * @param enfoqueProyecto Enfoque o tipo del proyecto.
     */
    public void crearProyectoNuevo(String nombreProyecto, String enfoqueProyecto) {
        try {
            MenuInicialLog.crearProyecto(nombreProyecto, enfoqueProyecto);
            if (listener != null) {
                listener.onProyectoCreado(); // Cambia de HTML si el listener está presente
            }
        } catch (IOException e) {
            System.err.println("Error al crear el proyecto: " + e.getMessage());
        }
    }

    /**
     * Abre un proyecto existente por su nombre, desde JavaScript.
     * @param nombreProyecto Nombre del proyecto a abrir.
     */
    public void abreProyecto(String nombreProyecto) {
        // NOTA: Si necesitas pasar el WebView, tendrías que inyectarla o gestionarlo de otro modo
        MenuInicialLog.abrirProyecto(nombreProyecto);
    }
}