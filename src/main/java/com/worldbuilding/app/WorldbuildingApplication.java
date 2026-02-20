package com.worldbuilding.app;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class WorldbuildingApplication {

    public static void main(String[] args) {
        // Dynamic Data Directory Logic
        String devPath = "./src/main/resources/db/data";
        String prodPath = "./db/data"; // Updated to match distribution structure
        String selectedPath;

        java.io.File devDir = new java.io.File(devPath);
        if (devDir.exists() && devDir.isDirectory()) {
            selectedPath = devPath;
            System.out.println(">>> ENVIRONMENT: DEV (Using " + selectedPath + ")");
        } else {
            selectedPath = prodPath;
            // Ensure db/data directories exist
            new java.io.File(prodPath).mkdirs();
            System.out.println(">>> ENVIRONMENT: PROD (Using " + selectedPath + ")");
        }

        System.setProperty("sqlite.data.path", selectedPath);

        SpringApplication.run(WorldbuildingApplication.class, args);
    }
}
