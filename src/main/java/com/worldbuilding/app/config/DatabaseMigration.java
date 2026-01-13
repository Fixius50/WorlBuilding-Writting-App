package com.worldbuilding.app.config;

import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Component;

import java.io.File;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.sql.Statement;

/**
 * Runs database migrations on application startup.
 * Adds missing columns to SQLite databases that Hibernate ddl-auto=update can't
 * handle.
 */
@Component
public class DatabaseMigration {

    private static final String DATA_DIR = "./src/main/resources/data/";

    @PostConstruct
    public void runMigrations() {
        System.out.println("=== Running SQLite Migrations ===");

        File dataDir = new File(DATA_DIR);
        if (!dataDir.exists() || !dataDir.isDirectory()) {
            System.out.println("Data directory not found: " + DATA_DIR);
            return;
        }

        File[] dbFiles = dataDir.listFiles((dir, name) -> name.endsWith(".db"));
        if (dbFiles == null || dbFiles.length == 0) {
            System.out.println("No database files found");
            return;
        }

        for (File dbFile : dbFiles) {
            migrateDatabase(dbFile);
        }

        System.out.println("=== SQLite Migrations Complete ===");
    }

    public void migrateDatabase(File dbFile) {
        String jdbcUrl = "jdbc:sqlite:" + dbFile.getAbsolutePath()
                + "?date_class=TEXT&date_string_format=yyyy-MM-dd HH:mm:ss";

        try (Connection conn = DriverManager.getConnection(jdbcUrl);
                Statement stmt = conn.createStatement()) {

            // Try to add favorite column - will fail silently if already exists
            try {
                stmt.execute("ALTER TABLE entidad_generica ADD COLUMN favorite BOOLEAN DEFAULT 0");
                System.out.println("[MIGRATION] Added 'favorite' column to: " + dbFile.getName());
            } catch (SQLException e) {
                if (e.getMessage().contains("duplicate column name")) {
                    System.out.println("[MIGRATION] Column 'favorite' already exists in: " + dbFile.getName());
                } else {
                    System.out.println("[MIGRATION] Skipped " + dbFile.getName() + ": " + e.getMessage());
                }
            }

        } catch (SQLException e) {
            System.err.println("[MIGRATION ERROR] Failed to migrate " + dbFile.getName() + ": " + e.getMessage());
        }
    }
}
