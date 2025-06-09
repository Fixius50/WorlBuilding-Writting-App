package com.worldbuilding;

import javafx.application.Application;
import javafx.application.Platform;
import javafx.concurrent.Worker;
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
        Platform.runLater(() ->{
            VBox root = new VBox();
            root.getStyleClass().add("custom-pane");

            WebView webView = new WebView();
            WebEngine webEngine = webView.getEngine();  // Obtener el WebEngine

            // Cargar el archivo HTML
            // En vez de usar File y ruta absoluta, se usa URL
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
        });
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
        // Controlador con métodos que se llamarán desde JS
        MenuInicialLog controlador = new MenuInicialLog();
        controlador.setWebEngine(webEngine);

        // Puente JS -> Java (no se mete dentro nada más)
        webEngine.getLoadWorker().stateProperty().addListener((obs, oldState, newState) -> {
            if (newState == Worker.State.SUCCEEDED) {
                JSObject window = (JSObject) webEngine.executeScript("window");
                window.setMember("javaConnector", controlador);
            }
        });

        // Aseguramos que al cerrar la ventana se cierre la app
        primaryStage.setOnCloseRequest(event -> {
            controlador.cerrarPrograma();
        });
    }

    /*
     * Siempre que se llame a una funcion de java mediante JavaScript, no es necesario poner la lógica aquí
     */

}