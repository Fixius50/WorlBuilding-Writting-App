package com.worldbuilding;

import javafx.application.Application;
import javafx.scene.Scene;
import javafx.scene.layout.VBox;
import javafx.scene.web.WebView;
import javafx.stage.Stage;

import java.io.File;

public class Main extends Application {
    @Override
    public void start(Stage primaryStage) {
    	VBox root = new VBox();
        root.getStyleClass().add("custom-pane");

        WebView webView = new WebView();
        File htmlFile = new File("../html/index.html");
        if (htmlFile.exists()) {
            webView.getEngine().load(htmlFile.toURI().toString());
        } else {
            System.out.println("Error: El archivo HTML no se encuentra en la ruta especificada.");
        }

        Scene scene = new Scene(root, 800, 600);
        // scene.getStylesheets().add("file:default/code/css/style.css");
        /*
         * La línea de arriba es para cuando se quieren enlazar el html al css y
         * que se ejecute bien java. Solo para ese caso se debe poner.
         * */
		root.getChildren().add(webView);
        primaryStage.setTitle("Aplicación WorldBuilding");
        primaryStage.setScene(scene);
        
        // Configurar la ventana para que se ponga en pantalla completa
        primaryStage.setFullScreen(true);

        // Alternativamente, si deseas mantener los bordes del sistema operativo:
        // primaryStage.setMaximized(true);
        
        primaryStage.show();
    }

    public static void main(String[] args) {
        launch(args);
    }
}
