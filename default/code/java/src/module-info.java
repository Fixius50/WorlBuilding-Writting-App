module AplicaciónWorldBuilding {
    requires javafx.controls; // Necesario para controles de JavaFX
    requires javafx.fxml; // Necesario si usas FXML
    requires javafx.web; // Necesario para WebView y WebEngine
    requires transitive javafx.graphics;
    requires jdk.jsobject; // Para soporte gráfico

    opens com.worldbuilding to javafx.fxml; // Permitir que JavaFX acceda a los miembros no públicos de tu paquete
    exports com.worldbuilding; // Exportar tu paquete para uso externo
}
