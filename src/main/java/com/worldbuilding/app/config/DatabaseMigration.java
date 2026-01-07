package com.worldbuilding.app.config;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.datasource.DriverManagerDataSource;
import org.springframework.stereotype.Component;

import java.io.File;

@Component
public class DatabaseMigration {

    public DatabaseMigration() {
    }

    /**
     * Called by MultiTenantDataSource to migrate specific tenant databases on the
     * fly.
     */
    public void migrateDatabase(File dbFile) {
        System.out.println("Migrating Tenant Database: " + dbFile.getAbsolutePath());

        DriverManagerDataSource ds = new DriverManagerDataSource();
        ds.setDriverClassName("org.sqlite.JDBC");
        ds.setUrl("jdbc:sqlite:" + dbFile.getAbsolutePath());

        JdbcTemplate tenantTemplate = new JdbcTemplate(ds);

        try {
            migrateUsingTemplate(tenantTemplate);
            System.out.println("Tenant Migration complete for: " + dbFile.getName());
        } catch (Exception e) {
            System.err.println("Failed to migrate tenant database: " + dbFile.getName());
            e.printStackTrace();
        }
    }

    private void migrateUsingTemplate(JdbcTemplate jdbcTemplate) {
        // --- 1. CUADERNO (Metadata del Proyecto) ---
        jdbcTemplate.execute("CREATE TABLE IF NOT EXISTS cuaderno (" +
                "id INTEGER PRIMARY KEY AUTOINCREMENT, " +
                "nombre_proyecto TEXT NOT NULL, " +
                "titulo TEXT, " +
                "descripcion TEXT, " +
                "tipo TEXT, " +
                "genero TEXT, " +
                "imagen_url TEXT, " +
                "fecha_creacion TEXT, " +
                "deleted INTEGER DEFAULT 0, " +
                "deleted_date TEXT" +
                ")");

        // --- 2. CARPETA (Jerarquía) ---
        jdbcTemplate.execute("CREATE TABLE IF NOT EXISTS carpeta (" +
                "id INTEGER PRIMARY KEY AUTOINCREMENT, " +
                "nombre TEXT NOT NULL, " +
                "proyecto_id INTEGER, " +
                "padre_id INTEGER, " +
                "tipo TEXT, " +
                "descripcion TEXT, " +
                "slug TEXT, " +
                "deleted INTEGER DEFAULT 0, " +
                "deleted_date TEXT" +
                ")");

        // --- 3. ENTIDAD_GENERICA (Personajes, Lugares, etc.) ---
        jdbcTemplate.execute("CREATE TABLE IF NOT EXISTS entidad_generica (" +
                "id INTEGER PRIMARY KEY AUTOINCREMENT, " +
                "nombre TEXT NOT NULL, " +
                "nombre_proyecto TEXT, " +
                "proyecto_id INTEGER, " +
                "carpeta_id INTEGER, " +
                "tipo_especial TEXT, " +
                "descripcion TEXT, " +
                "slug TEXT, " +
                "icon_url TEXT, " +
                "apariencia TEXT, " +
                "notas TEXT, " +
                "color TEXT, " +
                "tags TEXT, " +
                "deleted INTEGER DEFAULT 0, " +
                "deleted_date TEXT" +
                ")");

        // --- 4. ATRIBUTO_PLANTILLA (Definición de campos) ---
        jdbcTemplate.execute("CREATE TABLE IF NOT EXISTS atributo_plantilla (" +
                "id INTEGER PRIMARY KEY AUTOINCREMENT, " +
                "nombre TEXT NOT NULL, " +
                "tipo TEXT NOT NULL, " +
                "valor_defecto TEXT, " +
                "es_obligatorio INTEGER DEFAULT 0, " +
                "descripcion TEXT, " +
                "metadata TEXT, " +
                "carpeta_id INTEGER, " +
                "orden_visual INTEGER DEFAULT 0, " +
                "global INTEGER DEFAULT 0" +
                ")");

        // --- 5. ATRIBUTO_VALOR (Valores de los campos) ---
        jdbcTemplate.execute("CREATE TABLE IF NOT EXISTS atributo_valor (" +
                "id INTEGER PRIMARY KEY AUTOINCREMENT, " +
                "entidad_id INTEGER, " +
                "plantilla_id INTEGER, " +
                "valor TEXT" +
                ")");

        // --- 6. LINEA_TIEMPO & EVENTO_TIEMPO ---
        jdbcTemplate.execute("CREATE TABLE IF NOT EXISTS linea_tiempo (" +
                "id INTEGER PRIMARY KEY AUTOINCREMENT, " +
                "nombre TEXT NOT NULL, " +
                "descripcion TEXT, " +
                "es_raiz INTEGER DEFAULT 0" +
                ")");

        jdbcTemplate.execute("CREATE TABLE IF NOT EXISTS evento_tiempo (" +
                "id INTEGER PRIMARY KEY AUTOINCREMENT, " +
                "nombre TEXT NOT NULL, " +
                "descripcion TEXT, " +
                "fecha_texto TEXT, " +
                "orden_absoluto INTEGER, " +
                "linea_tiempo_id INTEGER" +
                ")");

        // --- 7. RELACION (Update) ---
        // Ensure base table exists first
        jdbcTemplate.execute("CREATE TABLE IF NOT EXISTS relacion (" +
                "id INTEGER PRIMARY KEY AUTOINCREMENT, " +
                "nodo_origen_id INTEGER, " +
                "nodo_destino_id INTEGER, " +
                "tipo_relacion TEXT, " +
                "tipo_origen TEXT, " +
                "tipo_destino TEXT, " +
                "descripcion TEXT, " +
                "metadata TEXT" +
                ")");

        // Add columns if they don't exist (for existing tables)
        addRelacionColumns(jdbcTemplate);

        // --- Migraciones específicas para columnas añadidas posteriormente ---
        // (Esto es redundante para bases nuevas pero repara las antiguas)

        if (!columnExists(jdbcTemplate, "entidad_generica", "color")) {
            try {
                jdbcTemplate.execute("ALTER TABLE entidad_generica ADD COLUMN color TEXT");
            } catch (Exception ignored) {
            }
        }

        if (!columnExists(jdbcTemplate, "entidad_generica", "tags")) {
            try {
                jdbcTemplate.execute("ALTER TABLE entidad_generica ADD COLUMN tags TEXT");
            } catch (Exception ignored) {
            }
        }
    }

    private void addRelacionColumns(JdbcTemplate jdbcTemplate) {
        String[] newColumns = { "tipo_origen", "tipo_destino", "descripcion", "metadata" };
        for (String col : newColumns) {
            if (!columnExists(jdbcTemplate, "relacion", col)) {
                try {
                    jdbcTemplate.execute("ALTER TABLE relacion ADD COLUMN " + col + " TEXT");
                } catch (Exception ignored) {
                }
            }
        }
    }

    private boolean columnExists(JdbcTemplate jdbcTemplate, String tableName, String columnName) {
        try {
            jdbcTemplate.queryForList("SELECT " + columnName + " FROM " + tableName + " LIMIT 1");
            return true;
        } catch (Exception e) {
            return false;
        }
    }
}
