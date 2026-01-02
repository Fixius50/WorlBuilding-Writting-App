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
        // runFrontendBuild(); // Disabled to prevent infinite dev restart loops
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

            if (exitCode == 0) {
                // Manually sync assets from src/main/resources/static to target/classes/static
                // This is necessary because the app is likely running from target/classes
                Path srcStatic = projectPath.resolve("src/main/resources/static");
                Path targetStatic = projectPath.resolve("target/classes/static");

                if (Files.exists(srcStatic) && Files.exists(targetStatic)) {
                    System.out.println(">>> SYNCING ASSETS: " + srcStatic + " -> " + targetStatic);
                    copyFolder(srcStatic, targetStatic);
                    System.out.println(">>> ASSET SYNC COMPLETE.");
                } else {
                    System.out.println(">>> SKIPPING ASSET SYNC (Target or Source not found).");
                }
            }

        } catch (Exception e) {
            System.err.println("!!! ERROR RUNNING FRONTEND BUILD: " + e.getMessage());
            e.printStackTrace();
        }
    }

    private static void copyFolder(Path source, Path target) throws java.io.IOException {
        Files.walk(source).forEach(sourcePath -> {
            try {
                Path targetPath = target.resolve(source.relativize(sourcePath));
                if (Files.isDirectory(sourcePath)) {
                    if (!Files.exists(targetPath))
                        Files.createDirectory(targetPath);
                } else {
                    Files.copy(sourcePath, targetPath, java.nio.file.StandardCopyOption.REPLACE_EXISTING);
                }
            } catch (Exception e) {
                System.err.println("Failed to copy " + sourcePath + ": " + e.getMessage());
            }
        });
    }
}
