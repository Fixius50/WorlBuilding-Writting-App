package com.worldbuilding;

import javafx.application.Application;
import javafx.application.Platform;
import javafx.beans.value.ChangeListener;
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

public class Main extends Application {

    private Stage mainStage;
    private Scene mainScene;
    private WebView webView;
    private WebEngine webEngine;

    private final JavaScriptBridge javaConnector = new JavaScriptBridge(); // Establece el puente entre el HTML con JavaScript
    private ChangeListener<Worker.State> loadListener; // Para manejar acciones con javaScript
    private static Main instance; // referencia global a la instancia en ejecución

    public Main() {instance = this;} // se establece cuando JavaFX crea la instancia

    public static Main getInstance() {return instance;}

    /**
     * Configura la ventana principal de la aplicación (Stage y Scene).
     * Establece tamaño, título, modo pantalla completa, y comportamiento al cerrar.
     */
    private void configurarVentanaAplicacion() {

        Rectangle2D screenBounds = Screen.getPrimary().getVisualBounds();
        double width = screenBounds.getWidth();   // Ancho de la pantalla
        double height = screenBounds.getHeight(); // Alto de la pantalla

        VBox layout = new VBox();                         // Contenedor raíz
        VBox.setVgrow(webView, Priority.ALWAYS);          // WebView ocupa todo el espacio disponible
        layout.getChildren().add(webView);                // Añade WebView al layout

        this.mainScene = new Scene(layout, width, height); // Crea la escena con dimensiones de pantalla
        this.mainStage.setScene(mainScene);                // Asocia la escena al Stage

        mainStage.setTitle("Aplicación WorldBuilding");    // Título de la ventana
        mainStage.setFullScreen(true);                     // Inicia en pantalla completa
        mainStage.setResizable(true);                      // Permite redimensionar la ventana

        // Define qué hacer cuando el usuario cierra la ventana
        mainStage.setOnCloseRequest(event -> Platform.exit());
    }

    public void resetearWebView() {
        VBox parentLayout = (VBox) mainScene.getRoot();  // Recupera el layout raíz actual

        // Elimina el WebView actual del layout
        parentLayout.getChildren().remove(webView);

        // Crea uno nuevo
        webView = new WebView();
        webEngine = webView.getEngine();

        // Asegura que crezca con el layout
        VBox.setVgrow(webView, Priority.ALWAYS);

        // Vuelve a añadirlo al layout
        parentLayout.getChildren().add(webView);
    }

    /**
     * Función que hace una transición entre los distintos html de la aplicación.
     * @param nombreHtml
     */
    public void cambiarHTML(String nombreHtml) {
        URL htmlUrl = getClass().getResource("/html/" + nombreHtml);
        if (htmlUrl != null) {

            // Limpia listener anterior si existe
            if (loadListener != null) {
                webEngine.getLoadWorker().stateProperty().removeListener(loadListener);
            }

            // Define y guarda el nuevo listener
            loadListener = (obs, oldState, newState) -> {
                if (newState == Worker.State.SUCCEEDED) {
                    JSObject window = (JSObject) webEngine.executeScript("window");
                    window.setMember("javaConnector", javaConnector);
                }
            };

            // Carga el nuevo Listener
            webEngine.getLoadWorker().stateProperty().addListener(loadListener);

            webEngine.load(htmlUrl.toExternalForm()); // Carga la página nueva

        } else {
            System.err.println("No se encontró el HTML: " + nombreHtml);
        }
    }

    /**
     * Función general para navegar entre distintos documentos/ventanas de la aplicación
     * @param nombreHtml
     */
    public void navegarA(String nombreHtml) {
        resetearWebView();
        cambiarHTML(nombreHtml);
    }


    /**
     * Método principal donde se ejecuta y configura la aplicación
     */
    @Override
    public void start(Stage primaryStage) {
        this.webView = new WebView();
        this.webEngine = webView.getEngine();
        this.mainStage = primaryStage;

        // Listener que inyecta javaConnector tras cada carga exitosa
        webEngine.getLoadWorker().stateProperty().addListener((obs, oldState, newState) -> {
            if (newState == javafx.concurrent.Worker.State.SUCCEEDED) {
                JSObject window = (JSObject) webEngine.executeScript("window");
                window.setMember("javaConnector", javaConnector);
                System.out.println("javaConnector inyectado en JavaScript");
            }
        });

        javaConnector.setNavigationListener(() -> {
            System.out.println("Proyecto creado. Navegando a ventanaProyectos.html...");
            navegarA("ventanaProyectos.html");
        });


        configurarVentanaAplicacion();
        cambiarHTML("menuInicialLog.html");
        mainStage.show();
    }

    public static void main(String[] args) {
        launch(args);
    }
}