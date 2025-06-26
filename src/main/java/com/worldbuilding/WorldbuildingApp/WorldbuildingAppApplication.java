package com.worldbuilding.WorldbuildingApp;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import java.awt.Desktop;
import java.net.URI;

@SpringBootApplication
public class WorldbuildingAppApplication {
	/**
	 * Primero arrancar XAMPP e iniciar MySQL
	 * Luego: ejecutar la app y poner en el navegador http://localhost:8080 y de seguido la ruta relativa.
	 */

    public static void main(String[] args) {
        SpringApplication.run(WorldbuildingAppApplication.class, args);
        try {
            Desktop.getDesktop().browse(new URI("http://localhost:8080/menuInicialLog.html"));
        } catch (Exception e) {
            System.err.println("No se pudo abrir el navegador automáticamente: " + e.getMessage());
        }
    }
}