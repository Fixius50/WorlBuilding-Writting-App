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

    private static final String DATA_DIR = "./src/main/resources/data/";

    @PostConstruct
    public void runMigrations() {
        System.out.println("=== Running SQLite Migrations (Flyway) ===");

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
        // Use raw SQLite connection for Flyway (no strict date parsing) to avoid
        // "Unparseable date" errors
        // on existing schema_history timestamps (which might use spaces instead of 'T')
        String jdbcUrl = "jdbc:sqlite:" + dbFile.getAbsolutePath();

        try {
            System.out.println("[MIGRATION] Migrating: " + dbFile.getName());

            Flyway flyway = Flyway.configure()
                    .dataSource(jdbcUrl, "", "")
                    .locations("classpath:db/migration")
                    // Baseline existing DBs to V1 (assuming they match V1 schema)
                    // If DB is empty, V1 runs.
                    // If DB has tables but no history, it's marked V1.
                    .baselineOnMigrate(true)
                    .baselineVersion("1")
                    .load();

            flyway.repair(); // Auto-repair checksums for dev iterations
            flyway.migrate();
            System.out.println("[MIGRATION] Success: " + dbFile.getName());

        } catch (Exception e) {
            System.err.println("[MIGRATION ERROR] Failed to migrate " + dbFile.getName() + ": " + e.getMessage());
            e.printStackTrace();
        }
    }
}
