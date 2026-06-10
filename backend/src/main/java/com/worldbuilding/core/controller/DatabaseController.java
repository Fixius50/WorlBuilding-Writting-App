package com.worldbuilding.core.controller;

import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/db")
@CrossOrigin(origins = "*")
public class DatabaseController {

    private final String PROJECTS_DIR = "projects";

    public DatabaseController() {
        // Ensure projects directory exists
        File dir = new File(PROJECTS_DIR);
        if (!dir.exists()) {
            dir.mkdirs();
        }
    }

    @GetMapping("/list")
    public List<String> listDatabases() throws IOException {
        Path path = Paths.get(PROJECTS_DIR);
        if (!Files.exists(path)) return new ArrayList<>();
        
        return Files.list(path)
                .filter(p -> p.toString().endsWith(".sqlite"))
                .map(p -> p.getFileName().toString().replace(".sqlite", ""))
                .collect(Collectors.toList());
    }

    @GetMapping("/download/{projectName}")
    public ResponseEntity<Resource> downloadDatabase(@PathVariable String projectName) {
        try {
            Path filePath = Paths.get(PROJECTS_DIR).resolve(projectName + ".sqlite").normalize();
            @SuppressWarnings("null")
            Resource resource = (Resource) new UrlResource(filePath.toUri());

            if (resource.exists()) {
                @SuppressWarnings("null")
                MediaType mediaType = (MediaType) MediaType.APPLICATION_OCTET_STREAM;
                return ResponseEntity.ok()
                        .contentType(mediaType)
                        .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + resource.getFilename() + "\"")
                        .body(resource);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (MalformedURLException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/upload/{projectName}")
    public ResponseEntity<String> uploadDatabase(@PathVariable String projectName, @RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body("File is empty");
        }

        try {
            Path targetPath = Paths.get(PROJECTS_DIR).resolve(projectName + ".sqlite");
            Files.copy(file.getInputStream(), targetPath, java.nio.file.StandardCopyOption.REPLACE_EXISTING);
            return ResponseEntity.ok("Database '" + projectName + "' uploaded successfully");
        } catch (IOException e) {
            return ResponseEntity.internalServerError().body("Failed to upload: " + e.getMessage());
        }
    }

    @GetMapping("/export/{projectName}")
    public ResponseEntity<Resource> exportProjectZip(@PathVariable String projectName) {
        try {
            Path dbPath = Paths.get(PROJECTS_DIR).resolve(projectName + ".sqlite").normalize();
            if (!Files.exists(dbPath)) {
                return ResponseEntity.notFound().build();
            }

            Path zipPath = Files.createTempFile(projectName + "_backup_", ".zip");
            
            try (java.util.zip.ZipOutputStream zos = new java.util.zip.ZipOutputStream(Files.newOutputStream(zipPath))) {
                // 1. Agregar el archivo de base de datos
                java.util.zip.ZipEntry dbEntry = new java.util.zip.ZipEntry(projectName + ".sqlite");
                zos.putNextEntry(dbEntry);
                Files.copy(dbPath, zos);
                zos.closeEntry();

                // 2. Buscar assets asociados al proyecto en maps_assets/ y agregarlos al ZIP
                Path assetsDir = Paths.get("maps_assets");
                if (Files.exists(assetsDir) && Files.isDirectory(assetsDir)) {
                    final String prefix = projectName + "_";
                    Files.list(assetsDir)
                        .filter(p -> p.getFileName().toString().startsWith(prefix))
                        .forEach(p -> {
                            try {
                                String entryName = "assets/" + p.getFileName().toString();
                                java.util.zip.ZipEntry assetEntry = new java.util.zip.ZipEntry(entryName);
                                zos.putNextEntry(assetEntry);
                                Files.copy(p, zos);
                                zos.closeEntry();
                            } catch (IOException ex) {
                                // ignorar fallos individuales de copia de assets
                            }
                        });
                }
            }

            Resource resource = new UrlResource(zipPath.toUri());
            MediaType mediaType = MediaType.APPLICATION_OCTET_STREAM;
            
            return ResponseEntity.ok()
                    .contentType(mediaType)
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + projectName + ".zip\"")
                    .body(resource);

        } catch (IOException e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping("/import/{projectName}")
    public ResponseEntity<Resource> importProjectZip(
            @PathVariable String projectName,
            @RequestParam("file") MultipartFile file) {
        
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        try {
            Path projectsPath = Paths.get(PROJECTS_DIR);
            Path assetsPath = Paths.get("maps_assets");
            if (!Files.exists(projectsPath)) Files.createDirectories(projectsPath);
            if (!Files.exists(assetsPath)) Files.createDirectories(assetsPath);

            Path finalDbPath = projectsPath.resolve(projectName + ".sqlite");

            // Descomprimir el ZIP
            try (java.util.zip.ZipInputStream zis = new java.util.zip.ZipInputStream(file.getInputStream())) {
                java.util.zip.ZipEntry entry;
                while ((entry = zis.getNextEntry()) != null) {
                    String name = entry.getName();
                    if (name.endsWith(".sqlite")) {
                        Files.copy(zis, finalDbPath, java.nio.file.StandardCopyOption.REPLACE_EXISTING);
                    } else if (name.startsWith("assets/")) {
                        String fileName = name.substring("assets/".length());
                        Path targetAssetPath = assetsPath.resolve(fileName);
                        Files.copy(zis, targetAssetPath, java.nio.file.StandardCopyOption.REPLACE_EXISTING);
                    }
                    zis.closeEntry();
                }
            }

            if (Files.exists(finalDbPath)) {
                Resource resource = new UrlResource(finalDbPath.toUri());
                return ResponseEntity.ok()
                        .contentType(MediaType.APPLICATION_OCTET_STREAM)
                        .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + projectName + ".sqlite\"")
                        .body(resource);
            } else {
                return ResponseEntity.internalServerError().build();
            }

        } catch (IOException e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}
