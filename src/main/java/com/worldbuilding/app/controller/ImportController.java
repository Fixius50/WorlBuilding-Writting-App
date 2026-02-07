package com.worldbuilding.app.controller;

import com.worldbuilding.app.config.DatabaseMigration;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Map;

@RestController
@RequestMapping("/api/import")
public class ImportController {

    @org.springframework.beans.factory.annotation.Value("${sqlite.data.path}")
    private String dataPath;

    @Autowired
    private DatabaseMigration databaseMigration;

    @PostMapping("/database")
    public ResponseEntity<?> importDatabase(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Archivo vacío"));
        }

        String fileName = file.getOriginalFilename();
        if (fileName == null || !fileName.endsWith(".db")) {
            return ResponseEntity.badRequest().body(Map.of("error", "Solo se admiten archivos .db de SQLite"));
        }

        try {
            // 1. Ensure data directory exists
            Path dataPath = Paths.get(this.dataPath);
            if (!Files.exists(dataPath)) {
                Files.createDirectories(dataPath);
            }

            // 2. Check if already exists for better feedback
            Path destPath = dataPath.resolve(fileName);
            boolean existed = Files.exists(destPath);

            // 3. Save file (Overwrite is intended for "restoration/sync")
            Files.copy(file.getInputStream(), destPath, java.nio.file.StandardCopyOption.REPLACE_EXISTING);

            System.out.println("[IMPORT] Database processed: " + fileName + (existed ? " (UPDATE)" : " (NEW)"));

            // 4. Run migrations on the new file to ensure it's compatible
            try {
                databaseMigration.migrateDatabase(destPath.toFile());
            } catch (Exception migEx) {
                return ResponseEntity.status(500).body(Map.of(
                        "error", "Archivo guardado, pero falló la migración técnica: " + migEx.getMessage()));
            }

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", existed ? "Universo actualizado: " + fileName : "Nuevo universo importado: " + fileName,
                    "projectName", fileName.substring(0, fileName.lastIndexOf(".")),
                    "updated", existed));

        } catch (IOException e) {
            return ResponseEntity.status(500)
                    .body(Map.of("error", "Fallo de E/S al guardar el archivo: " + e.getMessage()));
        }
    }
}
