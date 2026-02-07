package com.worldbuilding.app;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import java.awt.Desktop;
import java.net.ServerSocket;
import java.net.URI;

@SpringBootApplication
public class WorldbuildingApplication {

    @EventListener(ApplicationReadyEvent.class)
    public void launchBrowser(ApplicationReadyEvent event) {
        String portStr = event.getApplicationContext().getEnvironment().getProperty("local.server.port");
        if (portStr != null) {
            int port = Integer.parseInt(portStr);
            String url = "http://localhost:" + port;

            System.out.println(">>> App ready on port " + port + ". Launching browser...");
            System.setProperty("java.awt.headless", "false");
            try {
                if (Desktop.isDesktopSupported() && Desktop.getDesktop().isSupported(Desktop.Action.BROWSE)) {
                    Desktop.getDesktop().browse(new URI(url));
                } else {
                    new ProcessBuilder("rundll32", "url.dll,FileProtocolHandler", url).start();
                }
            } catch (Exception e) {
                System.err.println("!!! Failed to launch browser: " + e.getMessage());
            }
        }
    }

    public static void main(String[] args) {
        // Dynamic Data Directory Logic
        String devPath = "./src/main/resources/db/data";
        String prodPath = "./data";
        String selectedPath;

        java.io.File devDir = new java.io.File(devPath);
        if (devDir.exists() && devDir.isDirectory()) {
            selectedPath = devPath;
            System.out.println(">>> ENVIRONMENT: DEV (Using " + selectedPath + ")");
        } else {
            selectedPath = prodPath;
            new java.io.File(prodPath).mkdirs(); // Ensure prod data dir exists
            System.out.println(">>> ENVIRONMENT: PROD (Using " + selectedPath + ")");
        }

        System.setProperty("sqlite.data.path", selectedPath);

        SpringApplication.run(WorldbuildingApplication.class, args);
    }
}
