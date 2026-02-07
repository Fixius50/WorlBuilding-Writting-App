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
        int port = findAvailablePort(8080);
        System.setProperty("server.port", String.valueOf(port));
        SpringApplication.run(WorldbuildingApplication.class, args);
    }

    private static int findAvailablePort(int startPort) {
        int port = startPort;
        while (port < startPort + 100) {
            try (ServerSocket s = new ServerSocket(port)) {
                // If we get here, port is available
                System.out.println(">>> Port " + s.getLocalPort() + " is available.");
                return port;
            } catch (Exception e) {
                System.out.println(">>> Port " + port + " is occupied, trying next...");
                port++;
            }
        }
        return startPort; // Fallback to original if 100 ports are taken
    }
}
