package com.worldbuilding.app.config;

import com.worldbuilding.app.service.ProjectDiscoveryService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.io.File;
import java.nio.file.Files;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
public class MigrationArchitectureTest {

    @Autowired
    private ProjectDiscoveryService projectDiscoveryService;

    private static final String TEST_PROJECT_NAME = "ProofOfConceptProject";

    @BeforeEach
    void setup() {
        // Ensure clean state
        cleanUp();
    }

    @AfterEach
    void tearDown() {
        cleanUp();
    }

    private void cleanUp() {
        try {
            projectDiscoveryService.deleteProject(TEST_PROJECT_NAME);
        } catch (Exception e) {
            // Ignore if not exists
        }
    }

    @Test
    void verifyArchitecture_FlywayAndJson_ShouldWork() throws Exception {
        System.out.println("=== STARTING ARCHITECTURE VERIFICATION TEST ===");

        // 1. Create Project (Triggers DatabaseMigration)
        // This is the CRITICAL STEP: does it run Flyway?
        projectDiscoveryService.createProject(TEST_PROJECT_NAME, "POC Title", "Test Genre", null);

        // Locating the DB file (Assumes service uses default src/main/resources/data)
        // We replicate the Logic from service to find the file
        String rootDir = System.getProperty("user.dir");
        // Fix for when running inside subfolder vs root
        File dataDir = new File(rootDir, "src/main/resources/data");
        if (!dataDir.exists()) {
            dataDir = new File(rootDir, "WorldbuildingApp/src/main/resources/data");
        }

        File dbFile = new File(dataDir, TEST_PROJECT_NAME + ".db");
        assertTrue(dbFile.exists(), "The database file should have been created: " + dbFile.getAbsolutePath());
        System.out.println("[VERIFIED] DB File Created: " + dbFile.getAbsolutePath());

        String jdbcUrl = "jdbc:sqlite:" + dbFile.getAbsolutePath();

        try (Connection conn = DriverManager.getConnection(jdbcUrl)) {

            // 2. Verify Schema (did Flyway run?)
            // Check for 'flyway_schema_history'
            boolean flywayTableExists = false;
            try (ResultSet rs = conn.getMetaData().getTables(null, null, "flyway_schema_history", null)) {
                if (rs.next())
                    flywayTableExists = true;
            }
            assertTrue(flywayTableExists, "Flyway schema history table should exist.");
            System.out.println("[VERIFIED] Flyway Initialized.");

            // Check for 'entidad_generica'
            boolean entityTableExists = false;
            try (ResultSet rs = conn.getMetaData().getTables(null, null, "entidad_generica", null)) {
                if (rs.next())
                    entityTableExists = true;
            }
            assertTrue(entityTableExists, "Table 'entidad_generica' should exist (Migration V1 applied).");
            System.out.println("[VERIFIED] Schema Migration V1 applied.");

            // 3. Verify Hybrid JSON Persistence
            // We simulate what Hibernate does: inserting a JSON string into
            // 'json_attributes'
            String jsonPayload = "{\"power_level\": 9000, \"trait\": \"Legendary\"}";

            String insertSql = "INSERT INTO entidad_generica (nombre, proyecto_id, carpeta_id, json_attributes, deleted) VALUES (?, ?, ?, ?, 0)";

            // We need a valid project_id/carpeta_id. Since the creation seeded data...
            // Let's get the project ID first
            long projectId = 0;
            try (PreparedStatement s = conn.prepareStatement("SELECT id FROM cuaderno LIMIT 1");
                    ResultSet rs = s.executeQuery()) {
                if (rs.next())
                    projectId = rs.getLong(1);
            }
            // And a folder
            long folderId = 0;
            try (PreparedStatement s = conn.prepareStatement("SELECT id FROM carpeta WHERE proyecto_id = ? LIMIT 1")) {
                s.setLong(1, projectId);
                try (ResultSet rs = s.executeQuery()) {
                    if (rs.next())
                        folderId = rs.getLong(1);
                }
            }
            assertTrue(projectId > 0, "Seeding should have created a project record");
            assertTrue(folderId > 0, "Seeding should have created default folders");

            try (PreparedStatement stmt = conn.prepareStatement(insertSql)) {
                stmt.setString(1, "Test Entity");
                stmt.setLong(2, projectId);
                stmt.setLong(3, folderId);
                stmt.setString(4, jsonPayload);
                stmt.executeUpdate();
            }
            System.out.println("[ACTION] Inserted Entity with JSON payload.");

            // 4. Read Verification
            String selectSql = "SELECT json_attributes FROM entidad_generica WHERE nombre = ?";
            try (PreparedStatement stmt = conn.prepareStatement(selectSql)) {
                stmt.setString(1, "Test Entity");
                try (ResultSet rs = stmt.executeQuery()) {
                    assertTrue(rs.next(), "Should find the inserted entity");
                    String retrievedJson = rs.getString("json_attributes");

                    System.out.println("[READ] Retrieved JSON: " + retrievedJson);
                    assertNotNull(retrievedJson);
                    assertTrue(retrievedJson.contains("9000"));
                    assertTrue(retrievedJson.contains("Legendary"));
                }
            }
            System.out.println("[VERIFIED] Hybrid persistence successful.");

        }

        System.out.println("=== TEST SUCCESS ===");
    }
}
