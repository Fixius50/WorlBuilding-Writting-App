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
        // Configure Master DB
        DriverManagerDataSource master = new DriverManagerDataSource();
        master.setDriverClassName("org.sqlite.JDBC");
        master.setUrl("jdbc:sqlite:src/main/resources/data/worldbuilding.db");
        this.masterDataSource = master;
    }

    private DataSource determineDataSource() {
        Long tenantId = TenantContext.getCurrentTenant();

        // If no tenant context, use Master
        if (tenantId == null) {
            return masterDataSource;
        }

        // If tenant exists, retrieve or create its DataSource
        return tenantDataSources.computeIfAbsent(tenantId, id -> {
            DriverManagerDataSource ds = new DriverManagerDataSource();
            ds.setDriverClassName("org.sqlite.JDBC");
            // The user DB path
            ds.setUrl("jdbc:sqlite:src/main/resources/data/users/user_" + id + ".db");
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
