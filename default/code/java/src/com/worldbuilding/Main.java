package com.worldbuilding;

import javafx.application.Application;
import javafx.scene.Scene;
import javafx.scene.layout.VBox;
import javafx.scene.web.WebEngine;
import javafx.scene.web.WebView;
import javafx.stage.Stage;
import netscape.javascript.JSObject;

import java.io.File;

/**
 * @see Main
 * Clase que se dedica a iniciar la aplicación.
 */
public class Main extends Application{
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
        } else {
            System.out.println("Error: El archivo HTML no se encuentra en la ruta especificada.");
        }

        // --- NUEVO: Inyectar el objeto JavaBridge en la ventana JS ---
        webEngine.documentProperty().addListener((obs, oldDoc, newDoc) -> {
            if (newDoc != null) {
                JSObject window = (JSObject) webEngine.executeScript("window");
                window.setMember("app", new JavaBridge(primaryStage));
            }
        });
        // --- FIN NUEVO ---

        int ancho = (int) primaryStage.getMaxWidth();
        int alto = (int) primaryStage.getMaxHeight();

        Scene scene = new Scene(root, alto, ancho);
        /*
         * scene.getStylesheets().add("file:default/code/css/style.css");
         * La línea de arriba es para cuando se quieren enlazar el html al css y
         * que se ejecute bien java. Solo para ese caso se debe poner.
         */

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


    // No borrar esta función. Aquí se inicia la aplicación
    public static void main(String[] args) {
        launch(args);
    }
}
