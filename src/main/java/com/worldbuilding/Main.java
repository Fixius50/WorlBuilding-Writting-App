package com.worldbuilding;

import javafx.application.Application;
import javafx.geometry.Rectangle2D;
import javafx.scene.Scene;
import javafx.scene.layout.Priority;
import javafx.scene.layout.VBox;
import javafx.scene.web.WebEngine;
import javafx.scene.web.WebView;
import javafx.stage.Screen;
import javafx.stage.Stage;
import netscape.javascript.JSObject;

import java.io.File;
import java.io.IOException;
import java.net.URL;

public class Main extends Application {

    // Aquí se desarrolla la aplicación de inicio
    @Override
    public void start(Stage primaryStage) {
        VBox root = new VBox();
        root.getStyleClass().add("custom-pane");

        WebView webView = new WebView();
        WebEngine webEngine = webView.getEngine();  // Obtener el WebEngine

        // Cargar el archivo HTML
        // En vez de usar File y ruta absoluta
        URL htmlUrl = getClass().getResource("/html/menuInicialLog.html"); //La ruta es porque siempre el proyecto lo abre desde src/main
        if (htmlUrl != null) {
            webEngine.load(htmlUrl.toExternalForm());
        } else {
            System.err.println("No se encontró el archivo HTML");
        }

        //Configuración de la pantalla principal de la aplicación
        configuraciónPantallaAplicacion(primaryStage, root, webView);

        primaryStage.setTitle("Aplicación WorldBuilding");
        primaryStage.show();
        
        // Pasa el WebEngine al controlador
        controladoraDeEventos(primaryStage, webView, webEngine);
    }

    public static void configuraciónPantallaAplicacion(Stage primaryStage, VBox root, WebView webView){
        // Asegura que el WebView ocupe todo el espacio vertical
        VBox.setVgrow(webView, Priority.ALWAYS);
        root.getChildren().add(webView);

        // Obtener dimensiones de pantalla (sin bordes del sistema)
        Rectangle2D screenBounds = Screen.getPrimary().getVisualBounds();
        double width = screenBounds.getWidth();
        double height = screenBounds.getHeight();

        primaryStage.setX(screenBounds.getMinX());
        primaryStage.setY(screenBounds.getMinY());
        primaryStage.setWidth(width);
        primaryStage.setHeight(height);
        
        // Configura ventana a pantalla completa (opcional si usas screen bounds)
        primaryStage.setResizable(true); // Para poder reescalar manualmente la pantalla
        primaryStage.setFullScreen(true); // Para pantalla completa sin bordes
        primaryStage.centerOnScreen(); // Para que la pantalla aparezca centrada
        Scene scene = new Scene(root, width, height);
        primaryStage.setScene(scene);
    }

    /**
     * controladoraDeEventos(): Función donde se van a gestionar el resto del código, como eventos u otros componentes.
     *                          A este se le va a ir metiendo más funciones.
     * @param primaryStage
     * @param webEngine
     */
    public void controladoraDeEventos(Stage primaryStage, WebView webView, WebEngine webEngine){
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
                String nombreProyecto = (String) webEngine.executeScript("window.nombreProyecto");
                String tipoProyecto = (String) webEngine.executeScript("window.tipoProyecto");
                
                if (botonAbrirClicado != null && botonAbrirClicado) {
                    try {
                        controlador.abreProyecto(webEngine, nombreProyecto);
                    } catch (IOException e) {
                        throw new RuntimeException(e);
                    }
                }

                if (botonCrearClicado != null && botonCrearClicado) {
                    try {
                        controlador.crearProyectoNuevo(webEngine, nombreProyecto, tipoProyecto);
                        controlador.abreProyecto(webEngine, nombreProyecto);
                    } catch (IOException e) {
                        throw new RuntimeException(e);
                    }
                }
            }
        });

        if (controlador.compruebaProyecto()){
            // Aquí se cambiaría de pestaña (queda hacer esto)
            File htmlFile = new File("default/code/html/ventanaProyectos.html");
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