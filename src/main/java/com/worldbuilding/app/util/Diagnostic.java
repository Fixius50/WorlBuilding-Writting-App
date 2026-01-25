package com.worldbuilding.app.util;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.io.File;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.Statement;

@Component
public class Diagnostic implements CommandLineRunner {

    @org.springframework.beans.factory.annotation.Autowired
    private com.worldbuilding.app.repository.CuadernoRepository cuadernoRepository;

    private String resolvePath() {
        String rootDir = System.getProperty("user.dir");
        java.nio.file.Path basePath = java.nio.file.Paths.get(rootDir);
        if (!java.nio.file.Files.exists(basePath.resolve("src"))) {
            if (java.nio.file.Files.exists(basePath.resolve("WorldbuildingApp").resolve("src"))) {
                basePath = basePath.resolve("WorldbuildingApp");
            }
        }
        return basePath.resolve("src").resolve("main").resolve("resources").resolve("data").resolve("worldbuilding.db")
                .toString();
    }

    @Override
    public void run(String... args) throws Exception {
        System.out.println("=== STARTING DIAGNOSTIC ===");

        try {
            String dbPath = resolvePath();
            String jdbcUrl = "jdbc:sqlite:" + dbPath;

            // Only check raw JDBC if file exists, otherwise skip to Repo test
            if (!new File(dbPath).exists()) {
                System.out.println("Main DB file not found at: " + dbPath
                        + " (Skipping raw schema check - using In-Memory Master?)");
            } else {
                System.out.println("Checking 'cuaderno' table schema...");
                try (Connection conn = DriverManager.getConnection(jdbcUrl);
                        Statement stmt = conn.createStatement();
                        ResultSet rs = stmt.executeQuery("PRAGMA table_info(cuaderno)")) {
                    while (rs.next()) {
                        System.out.println(
                                " - Column (cuaderno): " + rs.getString("name") + " [" + rs.getString("type") + "]");
                    }
                }

                System.out.println("Checking 'carpeta' table schema...");
                try (Connection conn = DriverManager.getConnection(jdbcUrl);
                        Statement stmt = conn.createStatement();
                        ResultSet rs = stmt.executeQuery("PRAGMA table_info(carpeta)")) {
                    while (rs.next()) {
                        System.out.println(
                                " - Column (carpeta): " + rs.getString("name") + " [" + rs.getString("type") + "]");
                    }
                }

                try (Connection conn = DriverManager.getConnection(jdbcUrl);
                        Statement stmt = conn.createStatement();
                        ResultSet rs = stmt.executeQuery("PRAGMA table_info(entidad_generica)")) {
                    while (rs.next()) {
                        System.out.println(" - Column (entidad_generica): " + rs.getString("name") + " ["
                                + rs.getString("type") + "]");
                    }
                }

                try (Connection conn = DriverManager.getConnection(jdbcUrl);
                        Statement stmt = conn.createStatement();
                        ResultSet rs = stmt.executeQuery("PRAGMA table_info(atributo_plantilla)")) {
                    while (rs.next()) {
                        System.out.println(" - Column (atributo_plantilla): " + rs.getString("name") + " ["
                                + rs.getString("type") + "]");
                    }
                }
            }

            System.out.println("Testing Repository findAll()...");
            long count = cuadernoRepository.count();
            System.out.println("Repository found " + count + " projects.");
            cuadernoRepository.findAll().forEach(c -> {
                if (c != null) {
                    System.out.println(" - Found: " + c.getNombreProyecto() + ", Deleted: " + c.isDeleted());
                }
            });
            System.out.println("Repository Test: PASS");
        } catch (Exception e) {
            System.out.println("Repository Test: FAIL (" + e.getMessage() + ")");
            // e.printStackTrace(); // Disabled stack trace to reduce noise during dev
        }

        System.out.println("=== DIAGNOSTIC COMPLETE ===");
    }
}
