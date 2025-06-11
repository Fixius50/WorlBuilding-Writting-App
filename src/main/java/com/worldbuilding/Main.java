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
import java.util.HashMap;
import java.util.Map;

import java.io.IOException;

public class Main extends Application {

    private final Map<String, Scene> escenas = new HashMap<>();
    private final Map<String, WebEngine> motores = new HashMap<>(); // Stores pre-loaded WebEngines
    private Stage mainStage;

    // Métodos para que MenuInicialLog pueda interactuar con la UI de Main
    // Se pasan como argumentos al constructor de MenuInicialLog o como setters
    private void requestSceneChange(String htmlName) {
        cambiarEscena(htmlName);
    }

    private void requestShowAlert(String message) {
        Platform.runLater(() -> {
            WebEngine currentEngine = getActiveWebEngine();
            if (currentEngine != null) {
                currentEngine.executeScript("alert('" + message.replace("'", "\\'") + "');");
            }
        });
    }

    /**
     * Helper method to safely get the WebEngine of the currently active WebView,
     * for displaying alerts or executing JavaScript.
     * @return The WebEngine, or null if not found or not applicable.
     */
    private WebEngine getActiveWebEngine() {
        if (mainStage.getScene() != null && mainStage.getScene().getRoot() instanceof VBox) {
            VBox rootVBox = (VBox) mainStage.getScene().getRoot();
            if (!rootVBox.getChildren().isEmpty() && rootVBox.getChildren().get(0) instanceof WebView) {
                return ((WebView) rootVBox.getChildren().get(0)).getEngine();
            }
        }
        return null;
    }


    // javaConnector is private and now delegates logic to MenuInicialLog
    private final Object javaConnector = new Object() {
        public void cerrarPrograma() {
            Platform.exit();
        }

        public void crearProyectoNuevo(String nombreProyecto, String enfoqueProyecto) {
            // Delega la lógica principal a MenuInicialLog
            MenuInicialLog.crearProyectoNuevoDesdeUI(nombreProyecto, enfoqueProyecto,
                Main.this::requestSceneChange, // Pasa el callback para cambiar escena
                Main.this::requestShowAlert   // Pasa el callback para mostrar alerta
            );
        }

        public void abreProyecto(String nombreProyecto) {
            // Delega la lógica principal a MenuInicialLog
            MenuInicialLog.abreProyectoDesdeUI(nombreProyecto,
                Main.this::requestSceneChange, // Pasa el callback para cambiar escena
                Main.this::requestShowAlert   // Pasa el callback para mostrar alerta
            );
        }

        public void cambiarEscena(String nombreHtml) {
            // Delega a la función interna de Main para cambiar escena
            requestSceneChange(nombreHtml);
        }
    };


    @Override
    public void start(Stage primaryStage) {
        this.mainStage = primaryStage;

        Platform.setImplicitExit(true); // Default behavior is to exit when last window closes.
        mainStage.setOnCloseRequest(event -> {
            System.out.println("Cerrando la aplicación por el botón 'X' de la ventana.");
            Platform.exit(); // Explicitly exit when the main stage is closed by the user
        });

        // Asegurarse de que la base de datos general (plantilla) exista en el disco
        try {
            SQLiteConnector.copyGeneralDatabaseTemplateIfNeeded();
        } catch (IOException e) {
            System.err.println("Error al copiar la base de datos general: " + e.getMessage());
            Platform.exit();
            return;
        }

        // Pre-load all necessary scenes and WebEngines at startup
        crearEscena("menuInicialLog.html");
        crearEscena("ventanaAjustes.html");
        crearEscena("ventanaCreacion.html");
        crearEscena("ventanaProyectos.html"); // New target from login

        mainStage.setTitle("Aplicación WorldBuilding");
        mainStage.setFullScreen(true);
        mainStage.setResizable(true);

        cambiarEscena("menuInicialLog.html");
        mainStage.show();
    }

    private void crearEscena(String nombreHtml) {
        Rectangle2D screenBounds = Screen.getPrimary().getVisualBounds();
        double width = screenBounds.getWidth();
        double height = screenBounds.getHeight();

        WebView webView = new WebView();
        WebEngine webEngine = webView.getEngine();
        motores.put(nombreHtml, webEngine);

        VBox layout = new VBox();
        VBox.setVgrow(webView, Priority.ALWAYS);
        layout.getChildren().add(webView);

        Scene escena = new Scene(layout, width, height);
        escenas.put(nombreHtml, escena);

        URL htmlUrl = getClass().getResource("/html/" + nombreHtml);
        if (htmlUrl != null) {
            webEngine.getLoadWorker().stateProperty().addListener((obs, oldState, newState) -> {
                if (newState == Worker.State.SUCCEEDED) {
                    JSObject window = (JSObject) webEngine.executeScript("window");
                    window.setMember("javaConnector", javaConnector);
                    System.out.println("javaConnector injected into " + nombreHtml);
                }
            });
            webEngine.load(htmlUrl.toExternalForm());
        } else {
            System.err.println("No se encontró el HTML: " + nombreHtml);
        }
    }

    private void cambiarEscena(String nombreHtml) {
        Scene escena = escenas.get(nombreHtml);
        if (escena != null) {
            mainStage.setScene(escena);
            System.out.println("Cambiando a la escena: " + nombreHtml);
        } else {
            System.err.println("Escena no encontrada: " + nombreHtml);
        }
    }

    public static void main(String[] args) {
        launch(args);
    }
}