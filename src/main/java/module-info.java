module com.worldbuilding {
    requires transitive javafx.controls;
    requires transitive javafx.web;
    requires javafx.fxml; // solo si usas FXML
    requires java.sql;    // para SQLite
    requires jdk.jsobject; // para JSObject desde WebView

    exports com.worldbuilding;
}
