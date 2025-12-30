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

public class MultiTenantDataSource implements DataSource {

    private final Map<Long, DataSource> tenantDataSources = new ConcurrentHashMap<>();
    private final DataSource masterDataSource;

    public MultiTenantDataSource() {
        // Configure Master DB with absolute path
        String dbPath = resolveDataPath("worldbuilding.db");

        System.out.println(">>> MASTER DB PATH: " + dbPath); // Debug Log

        DriverManagerDataSource master = new DriverManagerDataSource();
        master.setDriverClassName("org.sqlite.JDBC");
        master.setUrl("jdbc:sqlite:" + dbPath);
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
        Long tenantId = TenantContext.getCurrentTenant();

        // If no tenant context, use Master
        if (tenantId == null) {
            return masterDataSource;
        }

        // If tenant exists, retrieve or create its DataSource
        return tenantDataSources.computeIfAbsent(tenantId, id -> {
            String dbPath = resolveDataPath("users/user_" + id + ".db");

            System.out.println(">>> TENANT DB PATH [" + id + "]: " + dbPath); // Debug Log

            DriverManagerDataSource ds = new DriverManagerDataSource();
            ds.setDriverClassName("org.sqlite.JDBC");
            ds.setUrl("jdbc:sqlite:" + dbPath);
            return ds;
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
