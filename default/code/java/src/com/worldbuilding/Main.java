package com.worldbuilding;

import javafx.application.Application;
import javafx.scene.Scene;
import javafx.scene.layout.VBox;
import javafx.scene.web.WebEngine;
import javafx.scene.web.WebView;
import javafx.stage.Stage;
import netscape.javascript.JSObject;

import java.io.File;
import java.io.IOException;

public class Main extends Application {

    // Aquí se desarrolla la aplicación de inicio
    @Override
    public void start(Stage primaryStage) {
        VBox root = new VBox();
        root.getStyleClass().add("custom-pane");

        WebView webView = new WebView();
        WebEngine webEngine = webView.getEngine();  // Obtener el WebEngine

        // Cargar el archivo HTML
        File htmlFileMenuInicialLog = new File("default/code/html/menuInicialLog.html");
        if (htmlFileMenuInicialLog.exists()) {
            webEngine.load(htmlFileMenuInicialLog.toURI().toString());
        }

        // ------------------------------------------------
        controladoraDeEventos(primaryStage, webEngine);
        // ------------------------------------------------

        // Continuación de la app
        int ancho = (int) primaryStage.getMaxWidth();
        int alto = (int) primaryStage.getMaxHeight();
        Scene scene = new Scene(root, alto, ancho);

        root.getChildren().add(webView);
        primaryStage.setTitle("Aplicación WorldBuilding"); // Título de la app
        primaryStage.setScene(scene);

        // Configurar la ventana para que NO se pueda redimensionar
        primaryStage.setResizable(false);

        // Configurar la ventana para que se ponga en pantalla completa (esto lo puedes mantener o quitar)
        primaryStage.setFullScreen(true);
        primaryStage.centerOnScreen();
        primaryStage.show();
    }

    /**
     * controladoraDeEventos(): Función donde se van a gestionar el resto del código, como eventos u otros componentes.
     *                          A este se le va a ir metiendo más funciones.
     * @param primaryStage
     * @param webEngine
     */
    public void controladoraDeEventos(Stage primaryStage, WebEngine webEngine){
        eventButton(primaryStage, webEngine); // para la clase MenuInicialLog que maneja sus botones
    }

    public void eventButton(Stage primaryStage, WebEngine webEngine){
        // Aquí recibe los parámetros de JavaScript del MenuInicialLog y se los envía a su clase
        MenuInicialLog controlador = new MenuInicialLog();

        // Escuchar cuando se haya cargado el documento HTML
        webEngine.getLoadWorker().stateProperty().addListener((obs, oldState, newState) -> {
            if (newState == javafx.concurrent.Worker.State.SUCCEEDED) {
                JSObject window = (JSObject) webEngine.executeScript("window");
                window.setMember("javaConnector", controlador); // El miembro es como una función base que es llamada desde javaScript

                // Ahora, verificamos si se ha activado alguna de las banderas de JavaScript
                Boolean botonAbrirClicado = (Boolean) webEngine.executeScript("window.botonAbrirClicado");
                Boolean botonCrearClicado = (Boolean) webEngine.executeScript("window.botonCrearClicado");

                if (botonAbrirClicado != null && botonAbrirClicado) {
                    System.out.println("Se ha clickeado 'Abrir Proyecto'.");
                    // Aquí tu lógica para cuando se hace clic en "Abrir"
                    // Puedes llamar a alguna función o manejar el estado.
                    // Recoger la variable 'nombreProyecto' de JavaScript después de hacer clic en "Abrir"
                    String nombreProyecto = (String) webEngine.executeScript("window.nombreProyecto");
                    try {
                        controlador.abreProyecto(nombreProyecto);
                    } catch (IOException e) {
                        throw new RuntimeException(e);
                    }
                }

                if (botonCrearClicado != null && botonCrearClicado) {
                    System.out.println("Se ha clickeado 'Crear Proyecto'.");
                    // Aquí tu lógica para cuando se hace clic en "Crear"
                    // Puedes llamar a alguna función o manejar el estado.
                    String nombreProyecto = (String) webEngine.executeScript("window.nombreProyecto");
                    String tipoProyecto = (String) webEngine.executeScript("window.tipoProyecto");
                    try {
                        controlador.crearProyectoNuevo(nombreProyecto, tipoProyecto);
                    } catch (IOException e) {
                        throw new RuntimeException(e);
                    }
                }
            }
        });

        if (controlador.compruebaProyecto()){
            // Aquí se cambiaría de pestaña (queda hacer esto)
            File htmlFile = new File("default/code/html/ventanaCreacion.html");
            webEngine.load(htmlFile.toURI().toString());
        }

        primaryStage.setOnCloseRequest(event -> {
            controlador.cerrarPrograma();
        });

    }

    // No borrar esta función. Aquí se inicia la aplicación
    public static void main(String[] args) {
        launch(args);
    }
}