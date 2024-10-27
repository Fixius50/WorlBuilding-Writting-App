package com.worldbuilding;

import javafx.scene.web.WebEngine;

public class MenuInicial {
    private WebEngine webEngine;

    // Constructor que recibe WebEngine
    public MenuInicial(WebEngine webEngine) {
        this.webEngine = webEngine;
    }

    // Método que será llamado desde JavaScript
    public void mostrarMensaje(String mensaje) {
        // Mostrar el mensaje en la consola de Java
        System.out.println("Mensaje desde JavaScript: " + mensaje);
        
        // Opcional: enviar una respuesta de vuelta a JavaScript
        // webEngine.executeScript("alert('Mensaje recibido: " + mensaje + "');");
    }
}
