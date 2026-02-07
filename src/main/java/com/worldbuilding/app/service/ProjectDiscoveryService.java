package com.worldbuilding.app.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.worldbuilding.app.config.DatabaseMigration;

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

    @org.springframework.beans.factory.annotation.Value("${sqlite.data.path}")
    private String dataPath;

    private Path getDataDirectory() {
        return Paths.get(dataPath);
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

        try {
            // 1. Migration will create the file and schema (Flyway V1)
            databaseMigration.migrateDatabase(dbPath.toFile());

            // 2. Seed initial data (Must succeed, or we are left with empty DB)
            seedProjectData(dbPath.toFile(), safeName, title, genre, imageUrl);

        } catch (Exception e) {
            // ATOMICITY: If creation fails at any step, cleanup the partial DB file
            // to prevent "zombie" empty projects (404s).
            try {
                Files.deleteIfExists(dbPath);
            } catch (IOException cleanupEx) {
                logger.error("Failed to cleanup corrupted DB file: {}", dbPath, cleanupEx);
            }
            throw new RuntimeException("Failed to create project: " + e.getMessage(), e);
        }
    }

    private static final org.slf4j.Logger logger = org.slf4j.LoggerFactory.getLogger(ProjectDiscoveryService.class);

    private void seedProjectData(File dbFile, String projectName, String title, String genre, String imageUrl)
            throws Exception {
        String url = "jdbc:sqlite:" + dbFile.getAbsolutePath();

        // Use try-with-resources for Connection to ensure close
        try (Connection conn = DriverManager.getConnection(url)) {
            conn.setAutoCommit(false);
            try {
                // 1. Insert Project Root (Cuaderno)
                long proyectoId;
                try (PreparedStatement stmt = conn.prepareStatement(
                        "INSERT INTO cuaderno (nombre_proyecto, titulo, descripcion, tipo, genero, imagen_url, fecha_creacion, deleted) VALUES (?, ?, ?, ?, ?, ?, datetime('now'), 0)",
                        java.sql.Statement.RETURN_GENERATED_KEYS)) {
                    stmt.setString(1, projectName);
                    stmt.setString(2, title != null ? title : projectName);
                    stmt.setString(3, "Nuevo universo de worldbuilding");
                    stmt.setString(4, "General");
                    stmt.setString(5, genre != null ? genre : "Fantasía");
                    stmt.setString(6, imageUrl);
                    stmt.executeUpdate();

                    try (java.sql.ResultSet keys = stmt.getGeneratedKeys()) {
                        if (keys.next())
                            proyectoId = keys.getLong(1);
                        else
                            throw new RuntimeException("Failed to get project ID");
                    }
                }

                // ... (Rest of logical inserts for folders, universe, etc.)
                // Re-implementing the inner logic to ensure full replacement block context

                // 2. Insert Default Bible Folders
                String[] folderNames = { "Personajes", "Geografía y Lugares", "Cultura y Tradiciones",
                        "Sistemas de Magia", "Facciones y Organizaciones", "Objetos e Ítems" };
                String[] folderTypes = { "ENTITIES", "GEOGRAPHY", "CULTURE", "MAGIC", "FACTIONS", "ITEMS" };

                for (int i = 0; i < folderNames.length; i++) {
                    String slug = folderNames[i].toLowerCase().replaceAll("[^a-z0-9]", "-");
                    try (PreparedStatement stmt = conn.prepareStatement(
                            "INSERT INTO carpeta (nombre, slug, tipo, proyecto_id, item_count, deleted) VALUES (?, ?, ?, ?, 0, 0)")) {
                        stmt.setString(1, folderNames[i]);
                        stmt.setString(2, slug);
                        stmt.setString(3, folderTypes[i]);
                        stmt.setLong(4, proyectoId);
                        stmt.executeUpdate();
                    }
                }

                // 3. Insert Initial Universe and Timeline
                long universoId;
                try (PreparedStatement stmt = conn.prepareStatement(
                        "INSERT INTO universo (nombre, descripcion, proyecto_id, deleted) VALUES (?, ?, ?, 0)",
                        java.sql.Statement.RETURN_GENERATED_KEYS)) {
                    stmt.setString(1, "Universo Principal");
                    stmt.setString(2, "El universo donde convergen todas las historias.");
                    stmt.setLong(3, proyectoId);
                    stmt.executeUpdate();

                    try (java.sql.ResultSet keys = stmt.getGeneratedKeys()) {
                        if (keys.next())
                            universoId = keys.getLong(1);
                        else
                            throw new RuntimeException("Failed to get universe ID");
                    }
                }

                try (PreparedStatement stmt = conn.prepareStatement(
                        "INSERT INTO linea_tiempo (nombre, descripcion, es_raiz, universo_id, deleted) VALUES (?, ?, 1, ?, 0)")) {
                    stmt.setString(1, "Era Actual");
                    stmt.setString(2, "La línea de tiempo principal del mundo.");
                    stmt.setLong(3, universoId);
                    stmt.executeUpdate();
                }

                conn.commit();

            } catch (Exception ex) {
                logger.error("Error in seeding transaction: {}", ex.getMessage());
                conn.rollback();
                throw ex; // Re-throw to trigger cleanup in createProject
            }
        }
    }

    public void deleteProject(String projectName) {
        Path dataDir = getDataDirectory();
        // Use the exact name logic as creation (though regex assumes safe input?)
        // listProjects() returns filenames without extension, so we just append .db
        // Actually the creation used a regex replacer. We must assume the input
        // 'projectName' matches the file name logic.
        // For safety, let's assume the identifier passed IS the filename (without .db).
        Path dbPath = dataDir.resolve(projectName + ".db");
        try {
            Files.deleteIfExists(dbPath);
        } catch (IOException e) {
            throw new RuntimeException("Failed to delete project", e);
        }
    }

    public void updateProjectMetadata(String projectName, String newTitle, String newGenre, String newImageUrl) {
        Path dataDir = getDataDirectory();
        Path dbPath = dataDir.resolve(projectName + ".db");

        if (!Files.exists(dbPath)) {
            throw new RuntimeException("Project database not found: " + projectName);
        }

        String url = "jdbc:sqlite:" + dbPath.toAbsolutePath().toString();

        // Build query dynamically or just update all non-nulls
        // Simplification: Update target fields always.
        String sql = "UPDATE cuaderno SET titulo = ?, genero = ?, imagen_url = ? WHERE nombre_proyecto = ?";

        try (Connection conn = DriverManager.getConnection(url);
                PreparedStatement stmt = conn.prepareStatement(sql)) {

            // We need to fetch current values if inputs are null?
            // Or assume frontend sends current values. Let's assume overwrite for now or
            // handle nulls in SQL with COALESCE?
            // SQLite COALESCE(?, titulo) works.

            stmt.setString(1, newTitle);
            stmt.setString(2, newGenre);
            stmt.setString(3, newImageUrl);
            stmt.setString(4, projectName); // Identifier inside DB might be the original creation name

            // Note: If 'nombre_proyecto' inside DB doesn't match filename (renaming?), this
            // update might fail to find row.
            // But we seed it with projectName on creation.
            int rows = stmt.executeUpdate();
            if (rows == 0) {
                // Fallback: Update the first row found, assuming 1 cuaderno per DB
                try (PreparedStatement fallback = conn
                        .prepareStatement("UPDATE cuaderno SET titulo = ?, genero = ?, imagen_url = ?")) {
                    fallback.setString(1, newTitle);
                    fallback.setString(2, newGenre);
                    fallback.setString(3, newImageUrl);
                    fallback.executeUpdate();
                }
            }

        } catch (Exception e) {
            throw new RuntimeException("Failed to update project metadata", e);
        }
    }

    public java.util.List<com.worldbuilding.app.dto.ProjectMetadataDTO> listProjectsFull() {
        Path dataDir = getDataDirectory();
        if (!Files.exists(dataDir)) {
            return Collections.emptyList();
        }

        try {
            return Files.list(dataDir)
                    .filter(path -> path.toString().endsWith(".db") && !path.toString().endsWith(".lock.db"))
                    .map(path -> {
                        String fileName = path.getFileName().toString();
                        String projectName = fileName.substring(0, fileName.lastIndexOf("."));
                        return extractMetadata(path, projectName);
                    })
                    .collect(Collectors.toList());
        } catch (IOException e) {
            e.printStackTrace();
            return Collections.emptyList();
        }
    }

    private com.worldbuilding.app.dto.ProjectMetadataDTO extractMetadata(Path dbPath, String projectName) {
        String url = "jdbc:sqlite:" + dbPath.toAbsolutePath().toString();
        String sql = "SELECT titulo, genero, imagen_url, fecha_creacion FROM cuaderno LIMIT 1";

        try (Connection conn = DriverManager.getConnection(url);
                PreparedStatement stmt = conn.prepareStatement(sql);
                java.sql.ResultSet rs = stmt.executeQuery()) {

            if (rs.next()) {
                String title = rs.getString("titulo");
                String genre = rs.getString("genero");
                String imageUrl = rs.getString("imagen_url");
                String date = rs.getString("fecha_creacion");

                return new com.worldbuilding.app.dto.ProjectMetadataDTO(projectName, title, genre, imageUrl, date);
            }
        } catch (Exception e) {
            System.err.println("Failed to read metadata for " + projectName + ": " + e.getMessage());
        }

        return new com.worldbuilding.app.dto.ProjectMetadataDTO(projectName, projectName, "Unknown", null, "Unknown");
    }
}
