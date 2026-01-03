package com.worldbuilding.app.service;

import com.worldbuilding.app.util.DatabaseMigration;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProjectDiscoveryService {

    @Autowired
    private DatabaseMigration databaseMigration;

    private Path getDataDirectory() {
        String rootDir = System.getProperty("user.dir");
        Path basePath = Paths.get(rootDir);

        if (!Files.exists(basePath.resolve("src"))) {
            if (Files.exists(basePath.resolve("WorldbuildingApp").resolve("src"))) {
                basePath = basePath.resolve("WorldbuildingApp");
            }
        }

        return basePath.resolve("src").resolve("main").resolve("resources").resolve("data");
    }

    public List<String> listProjects() {
        Path dataDir = getDataDirectory();
        if (!Files.exists(dataDir)) {
            return Collections.emptyList();
        }

        try {
            return Files.list(dataDir)
                    .filter(path -> path.toString().endsWith(".db") && !path.toString().endsWith(".lock.db"))
                    .map(path -> {
                        String fileName = path.getFileName().toString();
                        return fileName.substring(0, fileName.lastIndexOf("."));
                    })
                    .collect(Collectors.toList());
        } catch (IOException e) {
            e.printStackTrace();
            return Collections.emptyList();
        }
    }

    public void createProject(String projectName, String title, String genre, String imageUrl) {
        Path dataDir = getDataDirectory();
        String safeName = projectName.replaceAll("[^a-zA-Z0-9_-]", "_");
        Path dbPath = dataDir.resolve(safeName + ".db");

        if (Files.exists(dbPath)) {
            throw new RuntimeException("Project already exists");
        }

        // Migration will create the file and schema
        databaseMigration.migrateDatabase(dbPath.toFile());

        // Seed initial data
        seedProjectData(dbPath.toFile(), safeName, title, genre, imageUrl);
    }

    private void seedProjectData(File dbFile, String projectName, String title, String genre, String imageUrl) {
        String url = "jdbc:sqlite:" + dbFile.getAbsolutePath();
        try (Connection conn = DriverManager.getConnection(url);
                PreparedStatement stmt = conn.prepareStatement(
                        "INSERT INTO cuaderno (nombre_proyecto, titulo, descripcion, tipo, genero, imagen_url, fecha_creacion, deleted) VALUES (?, ?, ?, ?, ?, ?, datetime('now'), 0)")) {

            stmt.setString(1, projectName);
            stmt.setString(2, title != null ? title : projectName);
            stmt.setString(3, "New Project");
            stmt.setString(4, "General");
            stmt.setString(5, genre != null ? genre : "Fantasy");
            stmt.setString(6, imageUrl);
            stmt.executeUpdate();

        } catch (Exception e) {
            System.err.println("Failed to seed project data: " + e.getMessage());
            e.printStackTrace();
        }
    }

    public void deleteProject(String projectName) {
        Path dataDir = getDataDirectory();
        String safeName = projectName.replaceAll("[^a-zA-Z0-9_-]", "_");
        Path dbPath = dataDir.resolve(safeName + ".db");
        try {
            Files.deleteIfExists(dbPath);
        } catch (IOException e) {
            throw new RuntimeException("Failed to delete project", e);
        }
    }
}
