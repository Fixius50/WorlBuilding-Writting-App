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
    public void irAPagina(String nombreHtml) {
        Platform.runLater(() -> Main.getInstance().navegarA(nombreHtml));
    }


    /**
     * Devuelve el nombre del proyecto actualmente cargado.
     * Este método puede ser llamado desde JavaScript: window.javaConnector.obtenerInfoProyecto()
     * @return Nombre del proyecto actual.
     */
    public String obtenerDatosProyecto() {
        String nombre = MenuInicialLog.getNombreProyecto();
        String tipo = MenuInicialLog.getTipoProyecto();
        return nombre + " - " + tipo;
    }
    /*
        SQLiteConnector db = new SQLiteConnector(); --> Constructor
    
        <-- INSERTAR DATOS -->
        Map<String, String> datosConstruccion = new HashMap<>();
        datosConstruccion.put("Nombre", "Castillo Negro");
        datosConstruccion.put("Apellidos", "del Norte");
        datosConstruccion.put("Descripcion", "Fortaleza en la muralla");
        datosConstruccion.put("Tamaño", "Grande");
        datosConstruccion.put("Tipo", "Defensiva");
        datosConstruccion.put("ExtensionDeOtra", "Muralla");

        db.insertarDatosDB("CONSTRUCCION", datosConstruccion);

        <-- ELIMINAR DATOS -->
        Map<String, String> condiciones = new HashMap<>();
        condiciones.put("Nombre", "Castillo Negro");

        db.eliminarDatosDB("CONSTRUCCION", condiciones);

        <-- RECOGER DATOS (SIN FILTROS) -->
        String resultados = db.recogerDatosDB("CONSTRUCCION", null);
        System.out.println("Todos los datos:\n" + resultados);

        <-- RECOGER DATOS (CON FILTROS) -->
        Map<String, String> filtros = new HashMap<>();
        filtros.put("Nombre", "Castillo Negro");

        String resultadoFiltrado = db.recogerDatosDB("CONSTRUCCION", filtros);
        System.out.println("Datos filtrados:\n" + resultadoFiltrado);
    */
}