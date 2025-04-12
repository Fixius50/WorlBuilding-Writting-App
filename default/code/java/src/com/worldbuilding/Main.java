package com.worldbuilding;

import javafx.application.Application;
import javafx.application.Platform;
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

        /*
         * Aquí recibe los parámetros de JavaScript del MenuInicialLog y se los envía a su clase
         */
        MenuInicialLog controlador = new MenuInicialLog();

        // Escuchar cuando se haya cargado el documento HTML y exponer el objeto Java a JavaScript
        webEngine.documentProperty().addListener((obs, oldDoc, newDoc) -> {
            if (newDoc != null) {
                JSObject window = (JSObject) webEngine.executeScript("window");
                window.setMember("javaConnector", controlador);  // Exponer la clase Java como "javaConnector"
            }
        });

        primaryStage.setOnCloseRequest(e -> {
            cerrarPrograma();
        });

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
        primaryStage.setFullScreen(false);
        primaryStage.centerOnScreen();
        primaryStage.show();
    }

    /*
     * Este método indica que se quiere cerrar el programa que se haya pasado por JavaScript
     */
    public void cerrarPrograma() {
        System.out.println("Saliendo del programa...");
        Platform.exit();  // Esto termina la aplicación sin mostrar nada en la consola
    }

    // No borrar esta función. Aquí se inicia la aplicación
    public static void main(String[] args) {
        launch(args);
    }
}