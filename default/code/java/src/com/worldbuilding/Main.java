package com.worldbuilding;

import javafx.application.Application;
import javafx.scene.Scene;
import javafx.scene.layout.VBox;
import javafx.scene.web.WebEngine;
import javafx.scene.web.WebView;
import javafx.stage.Stage;
import netscape.javascript.JSObject;

import java.io.File;

public class Main extends Application {

    // Aquí se desarrolla la aplicación de inicio
    @Override
    public void start(Stage primaryStage) {
        VBox root = new VBox();
        root.getStyleClass().add("custom-pane");

        WebView webView = new WebView();
        WebEngine webEngine = webView.getEngine();  // Obtener el WebEngine

        // Cargar el archivo HTML
        File htmlFileMenuInicialLog = new File("default\\code\\html\\menuInicialLog.html");
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
        eventButonClose(primaryStage, webEngine); // para la clase MenuInicialLog
    }

    public void eventButonClose(Stage primaryStage, WebEngine webEngine){
        // Aquí recibe los parámetros de JavaScript del MenuInicialLog y se los envía a su clase
        MenuInicialLog controlador = new MenuInicialLog();

        // Escuchar cuando se haya cargado el documento HTML
        webEngine.documentProperty().addListener(e -> {
            if (e != null) {
                JSObject window = (JSObject) webEngine.executeScript("window");
                window.setMember("javaConnector", controlador);  
                // Exponer la clase Java como "javaConnector"
            }
        });

        primaryStage.setOnCloseRequest(event -> {
            if (controlador.isCloseRequested()) {
                controlador.cerrarPrograma();
            }
        });
    }

    // No borrar esta función. Aquí se inicia la aplicación
    public static void main(String[] args) {
        launch(args);
    }
}