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
@CrossOrigin(origins = "*") // Allow Vite/Electron access
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
            Resource resource = new UrlResource(filePath.toUri());

            if (resource.exists()) {
                return ResponseEntity.ok()
                        .contentType(MediaType.APPLICATION_OCTET_STREAM)
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
}
