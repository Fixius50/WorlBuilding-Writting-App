package com.worldbuilding.app.config;

import org.springframework.jdbc.datasource.DriverManagerDataSource;
import javax.sql.DataSource;
import java.io.PrintWriter;
import java.sql.Connection;
import java.sql.SQLException;
import java.sql.SQLFeatureNotSupportedException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.logging.Logger;
import com.worldbuilding.app.config.TenantContext;

public class MultiTenantDataSource implements DataSource {

    private final Map<String, DataSource> tenantDataSources = new ConcurrentHashMap<>();
    private final DataSource masterDataSource;
    private final DatabaseMigration databaseMigration;

    public MultiTenantDataSource(DatabaseMigration databaseMigration) {
        this.databaseMigration = databaseMigration;
        // Use persistent file 'worldbuilding.db' for Master Context
        String masterDbPath = resolveDataPath("worldbuilding.db");
        System.out.println(">>> MASTER DB PATH: " + masterDbPath);

        // Run migration on Master DB too (ensures schema exists even for Master)
        if (databaseMigration != null) {
            databaseMigration.migrateDatabase(new java.io.File(masterDbPath));
        }

        DriverManagerDataSource master = new DriverManagerDataSource();
        master.setDriverClassName("org.sqlite.JDBC");
        master.setUrl("jdbc:sqlite:" + masterDbPath);
        this.masterDataSource = master;
    }

    private String resolveDataPath(String fileName) {
        String rootDir = System.getProperty("user.dir");
        java.nio.file.Path basePath = java.nio.file.Paths.get(rootDir);

        // Check if we are in parent dir or project dir
        if (!java.nio.file.Files.exists(basePath.resolve("src"))) {
            if (java.nio.file.Files.exists(basePath.resolve("WorldbuildingApp").resolve("src"))) {
                basePath = basePath.resolve("WorldbuildingApp");
            }
        }

        return basePath.resolve("src").resolve("main").resolve("resources").resolve("data").resolve(fileName)
                .toString();
    }

    private DataSource determineDataSource() {
        String tenantId = TenantContext.getCurrentTenant();

        // If no tenant context, use Master
        if (tenantId == null) {
            return masterDataSource;
        }

        // If tenant exists, retrieve or create its DataSource
        return tenantDataSources.computeIfAbsent(tenantId, id -> {
            try {
                // [ROUTING LOGIC] Project DB is named '{id}.db' directly in the data folder.
                // E.g., 'Prime World' -> 'src/main/resources/data/Prime World.db'
                String dbPath = resolveDataPath(id + ".db");

                System.out.println(">>> PROJECT DB PATH [" + id + "]: " + dbPath); // Debug Log

                // Ensure schema exists via manual migration
                // MANUAL FLYWAY MIGRATION FOR TENANTS
                // Since Spring only runs Flyway on the @Primary DataSource (Master),
                // we must run it manually for each new tenant DB we open.
                org.flywaydb.core.Flyway flyway = org.flywaydb.core.Flyway.configure()
                        .dataSource("jdbc:sqlite:" + dbPath, "", "")
                        .locations("classpath:db/migration")
                        .baselineOnMigrate(true)
                        // .baselineVersion("1") // Do NOT set this or V1 won't run on empty!
                        .load();
                flyway.migrate();

                if (databaseMigration != null) {
                    // databaseMigration.migrateDatabase(new java.io.File(dbPath)); // Optional:
                    // Keep only if V1 doesn't cover it
                }

                DriverManagerDataSource ds = new DriverManagerDataSource();
                ds.setDriverClassName("org.sqlite.JDBC");
                ds.setUrl("jdbc:sqlite:" + dbPath);
                return ds;
            } catch (Exception e) {
                System.out.println(">>> [MultiTenantDataSource] FATAL ERROR connecting to tenant: " + id);
                e.printStackTrace();
                throw new RuntimeException("Failed to initialize tenant DB: " + id, e);
            }
        });
    }

    @Override
    public Connection getConnection() throws SQLException {
        return determineDataSource().getConnection();
    }

    @Override
    public Connection getConnection(String username, String password) throws SQLException {
        return determineDataSource().getConnection(username, password);
    }

    @Override
    public <T> T unwrap(Class<T> iface) throws SQLException {
        return determineDataSource().unwrap(iface);
    }

    @Override
    public boolean isWrapperFor(Class<?> iface) throws SQLException {
        return determineDataSource().isWrapperFor(iface);
    }

    @Override
    public PrintWriter getLogWriter() throws SQLException {
        return determineDataSource().getLogWriter();
    }

    @Override
    public void setLogWriter(PrintWriter out) throws SQLException {
        determineDataSource().setLogWriter(out);
    }

    @Override
    public void setLoginTimeout(int seconds) throws SQLException {
        determineDataSource().setLoginTimeout(seconds);
    }

    @Override
    public int getLoginTimeout() throws SQLException {
        return determineDataSource().getLoginTimeout();
    }

    @Override
    public Logger getParentLogger() throws SQLFeatureNotSupportedException {
        return determineDataSource().getParentLogger();
    }
}
