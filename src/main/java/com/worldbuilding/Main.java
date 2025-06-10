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
import java.net.URL;

public class Main extends Application implements NavegadorHTML {
    private WebEngine webEngine;
    private Stage primaryStage;
    private WebView webView;
    // Aquí se desarrolla la aplicación de inicio
    @Override
    public void start(Stage primaryStage) {
        this.primaryStage = primaryStage;
        VBox root = new VBox();
        root.getStyleClass().add("custom-pane");

        webView = new WebView();
        webEngine = webView.getEngine();  // Obtener el WebEngine

        //Configuración de la pantalla principal de la aplicación
        configuraciónPantallaAplicacion(primaryStage, root, webView);

        primaryStage.setTitle("Aplicación WorldBuilding");
        primaryStage.show();

        cargarPagina("/html/menuInicialLog.html");  // Carga inicial

        //Cargar el controlador
        eventButton();
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


    @Override
    public void cargarPagina(String rutaRelativa) {
        Platform.runLater(() -> {
            URL url = getClass().getResource(rutaRelativa);
            if (url != null) {
                System.out.println("✅ Cargando HTML: " + url.toExternalForm());
                webEngine.load(url.toExternalForm());
            } else {
                System.err.println("❌ No se encontró el HTML: " + rutaRelativa);
            }
        });
    }


    /*
     * Siempre que se llame a una funcion de java mediante JavaScript, no es necesario poner la lógica aquí
     */
    public void eventButton(){
        // Controlador con métodos que se llamarán desde JS
        MenuInicialLog controlador = new MenuInicialLog(this);

        // Puente JS -> Java (no se mete dentro nada más)
        webEngine.getLoadWorker().stateProperty().addListener((obs, oldState, newState) -> {
            if (newState == Worker.State.SUCCEEDED) {
                JSObject window = (JSObject) webEngine.executeScript("window");
                window.setMember("javaConnector", controlador);
            }
        });

        // Aseguramos que al cerrar la ventana se cierre la app
        primaryStage.setOnCloseRequest(event -> controlador.cerrarPrograma());
    }
}