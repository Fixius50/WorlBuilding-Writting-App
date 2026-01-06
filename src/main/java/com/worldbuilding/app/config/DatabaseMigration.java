package com.worldbuilding.app.config;

import org.springframework.boot.CommandLineRunner;
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
        // Table: entidad_generica - Ensure columns exist

        // Column: apariencia
        if (!columnExists(jdbcTemplate, "entidad_generica", "apariencia")) {
            System.out.println("Migrating: adding 'apariencia' column to 'entidad_generica'");
            try {
                jdbcTemplate.execute("ALTER TABLE entidad_generica ADD COLUMN apariencia TEXT");
            } catch (Exception ignored) {
            }
        }

        // Column: notas
        if (!columnExists(jdbcTemplate, "entidad_generica", "notas")) {
            System.out.println("Migrating: adding 'notas' column to 'entidad_generica'");
            try {
                jdbcTemplate.execute("ALTER TABLE entidad_generica ADD COLUMN notas TEXT");
            } catch (Exception ignored) {
            }
        }

        // Column: icon_url
        if (!columnExists(jdbcTemplate, "entidad_generica", "icon_url")) {
            System.out.println("Migrating: adding 'icon_url' column to 'entidad_generica'");
            try {
                jdbcTemplate.execute("ALTER TABLE entidad_generica ADD COLUMN icon_url TEXT");
            } catch (Exception ignored) {
            }
        }

        // Column: deleted_date
        if (!columnExists(jdbcTemplate, "entidad_generica", "deleted_date")) {
            System.out.println("Migrating: adding 'deleted_date' column to 'entidad_generica'");
            try {
                jdbcTemplate.execute("ALTER TABLE entidad_generica ADD COLUMN deleted_date TEXT");
            } catch (Exception ignored) {
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
