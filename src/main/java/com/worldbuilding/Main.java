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

public class Main extends Application{
    private WebEngine webEngine;
    private Stage primaryStage;
    private WebView webView;
    // Aquí se desarrolla la aplicación de inicio
    @Override
    public void start(Stage primaryStage) {
        this.webView = new WebView();
        this.webEngine = webView.getEngine();
        this.primaryStage = primaryStage;

        VBox root = new VBox();
        root.getStyleClass().add("custom-pane");
        // root.getChildren().add(webView);

        //Configuración de la pantalla principal de la aplicación
        configuraciónPantallaAplicacion(primaryStage, root, webView);

        cargarPaginaInicial();  // Carga inicial
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

        // Establece el nombre de la ventana y lo muestra
        primaryStage.setTitle("Aplicación WorldBuilding");
        primaryStage.show();
    }

    private void cargarPaginaInicial() {
        URL htmlUrl = getClass().getResource("/html/menuInicialLog.html");
        if (htmlUrl != null) {
            webEngine.load(htmlUrl.toExternalForm());
            setJavaConnector();  // muy importante volver a establecerlo después de cada carga
        }
    }

    private void cargarVentanaCreacion() {
        URL htmlUrl = getClass().getResource("/html/ventanaCreacion.html");
        if (htmlUrl != null) {
            webEngine.load(htmlUrl.toExternalForm());
        }
    }

    /*
     * Siempre que se llame a una funcion de java mediante JavaScript, no es necesario poner la lógica aquí
     */
    private void setJavaConnector() {
        MenuInicialLog menu = new MenuInicialLog();
        
        // Cuando la página esté completamente cargada
        webEngine.getLoadWorker().stateProperty().addListener((obs, oldState, newState) -> {
            if (newState == Worker.State.SUCCEEDED) {
                JSObject window = (JSObject) webEngine.executeScript("window");
                /*
                 * Esta funcion padre lo que hace es establecer el JSBridge a la ventana; el cual tiene funciones
                 * hijas a las que llama JavaScript
                 */
                
                Object javaConnector = new Object() {
                    public void cerrarPrograma() {
                        Platform.exit();
                    }

                    public void crearProyectoNuevo(String nombreProyecto, String enfoqueProyecto) {
                        try {
                            ProyectoSeleccionado proyecto = MenuInicialLog.crearProyecto(nombreProyecto, enfoqueProyecto);
                            abreProyecto(nombreProyecto);
                        } catch (Exception e) {
                            e.printStackTrace();
                        }
                    }

                    public void abreProyecto(String nombreProyecto) {
                        System.out.println("Intentando abrir: " + nombreProyecto);
                        if (MenuInicialLog.existeProyecto(nombreProyecto)) {
                            Platform.runLater(() -> cargarVentanaCreacion());
                        } else {
                            System.err.println("No existe el proyecto: " + nombreProyecto);
                        }
                    }
                };
                
                window.setMember("javaConnector", javaConnector);

                webEngine.executeScript("window.inicializarEventos && window.inicializarEventos()");
            }
        });
    }

    // Método que inicia la aplicación la aplicación
    public static void main(String[] args) {
        launch(args);
    }
}