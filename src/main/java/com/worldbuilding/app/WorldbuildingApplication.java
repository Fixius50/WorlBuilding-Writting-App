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
        SpringApplication.run(WorldbuildingApplication.class, args);
    }
}
