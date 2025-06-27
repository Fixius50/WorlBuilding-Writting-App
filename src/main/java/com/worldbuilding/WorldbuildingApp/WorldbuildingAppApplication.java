package com.worldbuilding.WorldbuildingApp;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class WorldbuildingAppApplication {
	/**
	 * Primero arrancar XAMPP e iniciar MySQL
	 * Luego: ejecutar la app y poner en el navegador http://localhost:8080 y de seguido la ruta relativa.
	 */

    public static void main(String[] args) {
        SpringApplication.run(WorldbuildingAppApplication.class, args);
        abrirNavegador("http://localhost:8080/menuInicialLog.html");
    }

    public static void abrirNavegador(String url) {
        try {
            String os = System.getProperty("os.name").toLowerCase();

            ProcessBuilder pb;

            if (os.contains("win")) {
                pb = new ProcessBuilder("rundll32", "url.dll,FileProtocolHandler", url);
                pb.start();
            } else if (os.contains("mac")) {
                pb = new ProcessBuilder("open", url);
                pb.start();
            } else if (os.contains("nix") || os.contains("nux") || os.contains("aix") || os.contains("linux")) {
                pb = new ProcessBuilder("xdg-open", url);
                pb.start();
            } else {
                System.err.println("Sistema operativo no soportado para abrir el navegador automáticamente.");
            }

        } catch (Exception e) {
            System.err.println("No se pudo abrir el navegador automáticamente: " + e.getMessage());
        }
    }

}