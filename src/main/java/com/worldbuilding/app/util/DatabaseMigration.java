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

    public void migrateDatabase(File dbFile) {
        System.out.println("Checking schema for: " + dbFile.getName());
        String url = "jdbc:sqlite:" + dbFile.getAbsolutePath();

        try (Connection conn = DriverManager.getConnection(url);
                Statement stmt = conn.createStatement()) {

            // STEP 0: Ensure tables exist (CREATE IF NOT EXISTS)
            createCuadernoTable(stmt);
            createCarpetaTable(stmt);
            createEntidadGenericaTable(stmt);
            createAtributoPlantillaTable(stmt);
            createAtributoValorTable(stmt);

            // 1. Check/Add 'cuaderno' columns
            migrateTable(stmt, "cuaderno", "deleted", "BOOLEAN DEFAULT 0");
            migrateTable(stmt, "cuaderno", "deleted_date", "DATETIME");

            // 2. Check/Add 'carpeta' columns
            migrateTable(stmt, "carpeta", "deleted", "BOOLEAN DEFAULT 0");

            migrateTable(stmt, "carpeta", "deleted_date", "DATETIME");
            migrateTable(stmt, "carpeta", "tipo", "VARCHAR(50)");
            migrateTable(stmt, "carpeta", "descripcion", "TEXT");
            migrateTable(stmt, "carpeta", "slug", "TEXT");

            // 3. Check/Add 'entidad_generica' columns
            migrateTable(stmt, "entidad_generica", "deleted", "BOOLEAN DEFAULT 0");
            migrateTable(stmt, "entidad_generica", "deleted_date", "DATETIME");
            migrateTable(stmt, "entidad_generica", "descripcion", "TEXT");
            migrateTable(stmt, "entidad_generica", "tags", "TEXT");
            migrateTable(stmt, "entidad_generica", "slug", "TEXT");

            // 4. Check/Add 'atributo_plantilla' columns
            migrateTable(stmt, "atributo_plantilla", "global", "BOOLEAN DEFAULT 0");

            // 4. Check/Add 'atributo_plantilla' columns
            migrateTable(stmt, "atributo_plantilla", "descripcion", "TEXT");

            // 5. Backfill Slugs if missing
            backfillSlugs(stmt, "carpeta");
            backfillSlugs(stmt, "entidad_generica");

        } catch (Exception e) {
            System.err.println("  [ERROR] Failed to migrate " + dbFile.getName() + ": " + e.getMessage());
        }
    }

    private void backfillSlugs(Statement stmt, String tableName) throws Exception {
        // Find rows with null slugs
        try (ResultSet rs = stmt
                .executeQuery("SELECT id, nombre FROM " + tableName + " WHERE slug IS NULL OR slug = ''")) {
            List<String> updates = new ArrayList<>();
            while (rs.next()) {
                long id = rs.getLong("id");
                String nombre = rs.getString("nombre");
                if (nombre == null)
                    nombre = "unnamed";

                // Simple slug generation for migration: name-id to ensure uniqueness without
                // complex logic
                String slug = nombre.toLowerCase()
                        .replaceAll("[^a-z0-9\\s-]", "") // Remove invalid chars
                        .replaceAll("\\s+", "-") // Replace spaces with dashes
                        + "-" + id; // Append ID to guarantee uniqueness for existing items

                updates.add("UPDATE " + tableName + " SET slug = '" + slug + "' WHERE id = " + id);
            }

            // Execute updates
            for (String sql : updates) {
                stmt.executeUpdate(sql);
            }
            if (!updates.isEmpty()) {
                System.out.println("  - Backfilled slugs for " + updates.size() + " items in " + tableName);
            }
        }
    }

    private void createCuadernoTable(Statement stmt) throws Exception {
        stmt.execute("""
                    CREATE TABLE IF NOT EXISTS cuaderno (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        nombre_proyecto VARCHAR(255) NOT NULL,
                        titulo VARCHAR(255),
                        descripcion TEXT,
                        tipo VARCHAR(255),
                        genero VARCHAR(255),
                        imagen_url TEXT,
                        fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
                        deleted BOOLEAN DEFAULT 0,
                        deleted_date DATETIME
                    )
                """);
    }

    private void createCarpetaTable(Statement stmt) throws Exception {
        stmt.execute("""
                    CREATE TABLE IF NOT EXISTS carpeta (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        nombre VARCHAR(255) NOT NULL,
                        proyecto_id BIGINT,
                        padre_id BIGINT,
                        tipo VARCHAR(50),
                        deleted BOOLEAN DEFAULT 0,
                        deleted_date DATETIME,
                        FOREIGN KEY (proyecto_id) REFERENCES cuaderno(id),
                        FOREIGN KEY (padre_id) REFERENCES carpeta(id)
                    )
                """);
    }

    private void createEntidadGenericaTable(Statement stmt) throws Exception {
        stmt.execute("""
                    CREATE TABLE IF NOT EXISTS entidad_generica (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        nombre VARCHAR(255) NOT NULL,
                        proyecto_id BIGINT,
                        carpeta_id BIGINT,
                        tipo_especial VARCHAR(255),
                        deleted BOOLEAN DEFAULT 0,
                        deleted_date DATETIME,
                        FOREIGN KEY (proyecto_id) REFERENCES cuaderno(id),
                        FOREIGN KEY (carpeta_id) REFERENCES carpeta(id)
                    )
                """);
    }

    private void createAtributoPlantillaTable(Statement stmt) throws Exception {
        stmt.execute("""
                    CREATE TABLE IF NOT EXISTS atributo_plantilla (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        nombre VARCHAR(255) NOT NULL,
                        tipo VARCHAR(255),
                        metadata TEXT,
                        valor_defecto TEXT,
                        es_obligatorio BOOLEAN DEFAULT 0,
                        descripcion TEXT,
                        orden_visual INTEGER DEFAULT 0,
                        carpeta_id BIGINT,
                        FOREIGN KEY (carpeta_id) REFERENCES carpeta(id)
                    )
                """);
    }

    private void createAtributoValorTable(Statement stmt) throws Exception {
        stmt.execute("""
                    CREATE TABLE IF NOT EXISTS atributo_valor (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        valor TEXT,
                        entidad_id BIGINT,
                        plantilla_id BIGINT,
                        FOREIGN KEY (entidad_id) REFERENCES entidad_generica(id),
                        FOREIGN KEY (plantilla_id) REFERENCES atributo_plantilla(id)
                    )
                """);
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
