package com.worldbuilding.app.config;

import jakarta.annotation.PostConstruct;
import org.flywaydb.core.Flyway;
import org.springframework.stereotype.Component;

import java.io.File;

/**
 * Runs database migrations on application startup.
 * Uses Flyway to migrate all discovered SQLite databases in the data directory.
 */
@Component
public class DatabaseMigration {

    @org.springframework.beans.factory.annotation.Value("${sqlite.data.path}")
    private String dataPath;

    @PostConstruct
    public void runMigrations() {
        System.out.println("=== Running SQLite Migrations (Flyway) ===");

        // Fix for [java.nio.file.AccessDeniedException: C:\WINDOWS\TEMP] on some
        // Windows systems.
        // Redirect SQLite native library extraction to a local directory.
        String rootDir = System.getProperty("user.dir");
        File sqliteTmpDir = new File(rootDir, "target/sqlite-tmp");
        if (!sqliteTmpDir.exists()) {
            sqliteTmpDir.mkdirs();
        }
        System.setProperty("org.sqlite.tmpdir", sqliteTmpDir.getAbsolutePath());
        System.out.println(">>> SQLite Temporary Directory set to: " + sqliteTmpDir.getAbsolutePath());

        File dataDir = new File(dataPath);
        if (!dataDir.exists() || !dataDir.isDirectory()) {
            System.out.println("Data directory not found: " + dataPath);
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
        // Use raw SQLite connection for Flyway (no strict date parsing) to avoid
        // "Unparseable date" errors
        // on existing schema_history timestamps (which might use spaces instead of 'T')
        String jdbcUrl = "jdbc:sqlite:" + dbFile.getAbsolutePath();

        try {
            System.out.println("[MIGRATION] Migrating: " + dbFile.getName());

            // 1. Pre-Flyway: Manual patch for common missing columns to avoid duplicate
            // errors in Flyway
            manualPatchMissingColumns(jdbcUrl);

            Flyway flyway = Flyway.configure()
                    .dataSource(jdbcUrl, "", "")
                    .locations("classpath:db/migration")
                    .ignoreMigrationPatterns("*:missing") // Ignore missing files (Flyway 10+)
                    .baselineOnMigrate(true)
                    .load();

            flyway.repair(); // Auto-repair checksums for dev iterations
            flyway.migrate();
            System.out.println("[MIGRATION] Success: " + dbFile.getName());

        } catch (Exception e) {
            System.err.println("[MIGRATION ERROR] Failed to migrate " + dbFile.getName() + ": " + e.getMessage());
            e.printStackTrace();
        }
    }

    private void manualPatchMissingColumns(String jdbcUrl) {
        try (java.sql.Connection conn = java.sql.DriverManager.getConnection(jdbcUrl);
                java.sql.Statement stmt = conn.createStatement()) {

            patchTable(stmt, "hoja", new String[] { "deleted", "deleted_date", "numero_pagina", "titulo" });
            patchTable(stmt, "nota_rapida", new String[] { "deleted", "deleted_date", "linea", "categoria" });
            patchTable(stmt, "relacion", new String[] { "deleted", "deleted_date" });
            patchTable(stmt, "conlang", new String[] { "font_binary" });
            patchTable(stmt, "palabra", new String[] { "unicode_code" });

        } catch (java.sql.SQLException e) {
            // Ignore if table doesn't exist yet
        }
    }

    private void patchTable(java.sql.Statement stmt, String table, String[] columns) throws java.sql.SQLException {
        java.util.Set<String> existingCols = new java.util.HashSet<>();
        try (java.sql.ResultSet rs = stmt.executeQuery("PRAGMA table_info(" + table + ")")) {
            while (rs.next()) {
                existingCols.add(rs.getString("name").toLowerCase());
            }
        } catch (java.sql.SQLException e) {
            return; // Table probably doesn't exist
        }

        for (String col : columns) {
            if (!existingCols.contains(col.toLowerCase())) {
                String type = col.contains("date") ? "TEXT"
                        : (col.equals("numero_pagina") ? "INTEGER"
                                : (col.equals("font_binary") ? "BLOB" : "TEXT"));
                try {
                    stmt.execute("ALTER TABLE " + table + " ADD COLUMN " + col + " " + type);
                    System.out.println("   [PATCH] Added column " + col + " to " + table);
                } catch (java.sql.SQLException e) {
                    // Column might have been added by another thread/process
                }
            }
        }
    }
}
