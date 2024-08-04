module AplicaciónWorldBuilding {
    requires javafx.controls;
    requires javafx.fxml;
    requires javafx.web;
    requires transitive javafx.graphics;

    opens com.worldbuilding to javafx.fxml;
    exports com.worldbuilding;
}
