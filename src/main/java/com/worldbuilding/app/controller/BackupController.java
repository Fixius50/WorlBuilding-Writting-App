package com.worldbuilding.app.controller;

import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.*;
import java.nio.file.*;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

@RestController
@RequestMapping("/api/backup")
public class BackupController {

    private static final String DATA_DIR = "src/main/resources/data/";

    @GetMapping("/download")
    public ResponseEntity<Resource> downloadBackup(
            @org.springframework.web.bind.annotation.RequestParam(required = false) java.util.List<String> projects) {
        String zipFileName = "worldbuilding_backup_" + System.currentTimeMillis() + ".zip";
        Path zipPath = Paths.get(System.getProperty("java.io.tmpdir"), zipFileName);

        try (FileOutputStream fos = new FileOutputStream(zipPath.toFile());
                ZipOutputStream zos = new ZipOutputStream(fos)) {

            // 1. Backup filtered/all databases in the data directory
            Path dataPath = Paths.get(DATA_DIR);
            if (Files.exists(dataPath) && Files.isDirectory(dataPath)) {
                File[] dbFiles = dataPath.toFile().listFiles((dir, name) -> name.endsWith(".db"));
                if (dbFiles != null) {
                    for (File db : dbFiles) {
                        String nameWithoutExt = db.getName().substring(0, db.getName().lastIndexOf("."));

                        // Only add if explicitly in projects list (if list provided)
                        if (projects == null || projects.isEmpty() || projects.contains(nameWithoutExt)) {
                            addToZipFile(db, "databases/", zos);
                        }
                    }
                }
            }

        } catch (IOException e) {
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }

        Resource resource = new FileSystemResource(zipPath.toFile());
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + zipFileName + "\"")
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(resource);
    }

    private void addToZipFile(File file, String pathInZip, ZipOutputStream zos) throws IOException {
        try (FileInputStream fis = new FileInputStream(file)) {
            ZipEntry zipEntry = new ZipEntry(pathInZip + file.getName());
            zos.putNextEntry(zipEntry);

            byte[] bytes = new byte[1024];
            int length;
            while ((length = fis.read(bytes)) >= 0) {
                zos.write(bytes, 0, length);
            }
            zos.closeEntry();
        }
    }
}
