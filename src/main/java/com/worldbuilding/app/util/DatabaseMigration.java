package com.worldbuilding.app.util;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.io.File;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;

@Component
public class DatabaseMigration implements CommandLineRunner {

    @Override
    public void run(String... args) throws Exception {
        System.out.println("=== STARTING DATABASE SPECIFIC MIGRATION ===");

        File rootDataDir = new File("src/main/resources/data");
        List<File> dbFiles = new ArrayList<>();
        findDbFiles(rootDataDir, dbFiles);

        System.out.println("Found " + dbFiles.size() + " database files in " + rootDataDir.getAbsolutePath());

        for (File dbFile : dbFiles) {
            migrateDatabase(dbFile);
        }

        System.out.println("=== MIGRATION COMPLETE ===");
    }

    private void findDbFiles(File dir, List<File> dbFiles) {
        if (!dir.exists() || !dir.isDirectory())
            return;

        File[] files = dir.listFiles();
        if (files != null) {
            for (File file : files) {
                if (file.isDirectory()) {
                    findDbFiles(file, dbFiles);
                } else if (file.getName().endsWith(".db") && !file.getName().endsWith(".lock.db")) {
                    dbFiles.add(file);
                }
            }
        }
    }

    private void migrateDatabase(File dbFile) {
        System.out.println("Checking schema for: " + dbFile.getName());
        String url = "jdbc:sqlite:" + dbFile.getAbsolutePath();

        try (Connection conn = DriverManager.getConnection(url);
                Statement stmt = conn.createStatement()) {

            // 1. Check/Add 'cuaderno' columns
            migrateTable(stmt, "cuaderno", "deleted", "BOOLEAN DEFAULT 0");
            migrateTable(stmt, "cuaderno", "deleted_date", "DATETIME");

            // 2. Check/Add 'carpeta' columns
            migrateTable(stmt, "carpeta", "deleted", "BOOLEAN DEFAULT 0");
            migrateTable(stmt, "carpeta", "deleted_date", "DATETIME");

            // 3. Check/Add 'entidad_generica' columns
            migrateTable(stmt, "entidad_generica", "deleted", "BOOLEAN DEFAULT 0");
            migrateTable(stmt, "entidad_generica", "deleted_date", "DATETIME");

        } catch (Exception e) {
            System.err.println("  [ERROR] Failed to migrate " + dbFile.getName() + ": " + e.getMessage());
        }
    }

    private void migrateTable(Statement stmt, String tableName, String columnName, String columnType) {
        try {
            boolean hasColumn = false;
            try (ResultSet rs = stmt.executeQuery("PRAGMA table_info(" + tableName + ")")) {
                while (rs.next()) {
                    if (columnName.equalsIgnoreCase(rs.getString("name"))) {
                        hasColumn = true;
                        break;
                    }
                }
            }

            if (!hasColumn) {
                System.out.println("  - Adding missing column '" + columnName + "' to table '" + tableName + "'");
                stmt.execute("ALTER TABLE " + tableName + " ADD COLUMN " + columnName + " " + columnType);
            } else {
                // System.out.println(" - Column '" + columnName + "' exists.");
            }
        } catch (Exception e) {
            // Ignore if table doesn't exist, as not all DBs might have it initialized
            System.err.println(" [WARN] Could not check/add column " + columnName + ": "
                    + e.getMessage());
        }
    }
}
