package com.worldbuilding.app;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import java.io.BufferedReader;
import java.io.File;
import java.io.InputStreamReader;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@SpringBootApplication
public class WorldbuildingApplication {

    public static void main(String[] args) {
        // Execute frontend build directly from Java to match BAT behavior
        runFrontendBuild();
        SpringApplication.run(WorldbuildingApplication.class, args);
    }

    private static void runFrontendBuild() {
        System.out.println(">>> STARTING FRONTEND BUILD (NPM) FROM JAVA...");
        try {
            String rootDir = System.getProperty("user.dir");
            Path projectPath = Paths.get(rootDir);

            // Locate project root containing 'package.json'
            if (!Files.exists(projectPath.resolve("package.json"))) {
                if (Files.exists(projectPath.resolve("WorldbuildingApp").resolve("package.json"))) {
                    projectPath = projectPath.resolve("WorldbuildingApp");
                }
            }

            if (!Files.exists(projectPath.resolve("package.json"))) {
                System.out.println("!!! WARNING: package.json not found. Skipping build.");
                return;
            }

            boolean isWindows = System.getProperty("os.name").toLowerCase().startsWith("win");
            ProcessBuilder builder = new ProcessBuilder();
            if (isWindows) {
                builder.command("cmd.exe", "/c", "npm run build");
            } else {
                builder.command("sh", "-c", "npm run build");
            }

            builder.directory(projectPath.toFile());
            builder.redirectErrorStream(true);

            Process process = builder.start();

            // Stream output to console
            try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    System.out.println("[NPM] " + line);
                }
            }

            int exitCode = process.waitFor();
            System.out.println(">>> FRONTEND BUILD FINISHED. Exit Code: " + exitCode);

        } catch (Exception e) {
            System.err.println("!!! ERROR RUNNING FRONTEND BUILD: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
