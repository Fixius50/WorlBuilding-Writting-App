package com.worldbuilding;

import javafx.scene.web.WebEngine;

public class MenuInicial {
    private WebEngine webEngine;

    @SuppressWarnings("exports")
    public void setWebEngine(WebEngine webEngine){
        this.webEngine = webEngine;
    }

    @SuppressWarnings("exports") // Lo que hace es eliminar el mensaje de que falta el módulo
    public WebEngine getWebEngine(){
        return webEngine;
    }

    // Constructor que recibe WebEngine
    @SuppressWarnings("exports")
    public MenuInicial(WebEngine webEngine) {
        this.webEngine = webEngine;
    }

    // métodos

    public static void recogeDatosMenuInicial(){
        
    }
    
}