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

    @Override
    public void run(String... args) throws Exception {
        System.out.println("=== STARTING DIAGNOSTIC ===");

        try {
            System.out.println("Checking 'cuaderno' table schema...");
            try (Connection conn = DriverManager.getConnection("jdbc:sqlite:src/main/resources/data/worldbuilding.db");
                    Statement stmt = conn.createStatement();
                    ResultSet rs = stmt.executeQuery("PRAGMA table_info(cuaderno)")) {
                while (rs.next()) {
                    System.out.println(
                            " - Column (cuaderno): " + rs.getString("name") + " [" + rs.getString("type") + "]");
                }
            }

            System.out.println("Checking 'carpeta' table schema...");
            try (Connection conn = DriverManager.getConnection("jdbc:sqlite:src/main/resources/data/worldbuilding.db");
                    Statement stmt = conn.createStatement();
                    ResultSet rs = stmt.executeQuery("PRAGMA table_info(carpeta)")) {
                while (rs.next()) {
                    System.out.println(
                            " - Column (carpeta): " + rs.getString("name") + " [" + rs.getString("type") + "]");
                }
            }

            try (Connection conn = DriverManager.getConnection("jdbc:sqlite:src/main/resources/data/worldbuilding.db");
                    Statement stmt = conn.createStatement();
                    ResultSet rs = stmt.executeQuery("PRAGMA table_info(entidad_generica)")) {
                while (rs.next()) {
                    System.out.println(" - Column (entidad_generica): " + rs.getString("name") + " ["
                            + rs.getString("type") + "]");
                }
            }

            try (Connection conn = DriverManager.getConnection("jdbc:sqlite:src/main/resources/data/worldbuilding.db");
                    Statement stmt = conn.createStatement();
                    ResultSet rs = stmt.executeQuery("PRAGMA table_info(atributo_plantilla)")) {
                while (rs.next()) {
                    System.out.println(" - Column (atributo_plantilla): " + rs.getString("name") + " ["
                            + rs.getString("type") + "]");
                }
            }

            System.out.println("Testing Repository findAll()...");
            long count = cuadernoRepository.count();
            System.out.println("Repository found " + count + " projects.");
            cuadernoRepository.findAll().forEach(
                    c -> System.out.println(" - Found: " + c.getNombreProyecto() + ", Deleted: " + c.isDeleted()));
            System.out.println("Repository Test: PASS");
        } catch (Exception e) {
            System.out.println("Repository Test: FAIL (" + e.getMessage() + ")");
            // e.printStackTrace(); // Disabled stack trace to reduce noise during dev
        }

        System.out.println("=== DIAGNOSTIC COMPLETE ===");
    }
}
