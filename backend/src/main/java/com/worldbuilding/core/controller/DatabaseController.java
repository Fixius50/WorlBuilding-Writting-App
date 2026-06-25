package com.worldbuilding.core.controller;

import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.text.Normalizer;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;
import java.util.concurrent.Executor;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/db")
@CrossOrigin(origins = "*")
public class DatabaseController {

    private static final String BACKUPS_DIR = "backup";
    private static final Pattern DIACRITICS_PATTERN = Pattern.compile("\\p{M}+");
    private static final String SQLITE_EXTENSION = ".sqlite";
    private final Executor dbTaskExecutor;
    private final ConcurrentMap<String, ImportJobState> importJobs = new ConcurrentHashMap<>();

    public static class ImportJobResponse {
        public String jobId;
        public String status;
        public String message;

        public ImportJobResponse(String jobId, String status, String message) {
            this.jobId = jobId;
            this.status = status;
            this.message = message;
        }
    }

    public static class ImportJobState {
        public String jobId;
        public String projectName;
        public String status;
        public int progress;
        public String message;
        public String error;

        public ImportJobState(String jobId, String projectName) {
            this.jobId = jobId;
            this.projectName = projectName;
            this.status = "queued";
            this.progress = 0;
            this.message = "Importación en cola.";
            this.error = null;
        }
    }

    private List<Path> getCandidateBackupDirs() {
        List<Path> candidates = new ArrayList<>();
        candidates.add(Paths.get(BACKUPS_DIR));
        return candidates;
    }

    private Path resolvePrimaryProjectsDir() {
        List<Path> candidates = getCandidateBackupDirs();
        Path selected = null;

        for (Path candidate : candidates) {
            if (Files.exists(candidate) && Files.isDirectory(candidate)) {
                selected = candidate;
                break;
            }
        }

        if (selected == null) {
            selected = candidates.get(0);
        }

        return selected;
    }

    private Path resolveDatabasePathForRead(String projectName) {
        String canonicalProjectName = sanitizeProjectName(projectName);
        Path resolvedPath = null;

        for (Path dir : getCandidateBackupDirs()) {
            Path candidate = dir.resolve(canonicalProjectName + SQLITE_EXTENSION).normalize();
            if (Files.exists(candidate)) {
                resolvedPath = candidate;
                break;
            }
        }

        if (resolvedPath == null) {
            resolvedPath = findDatabasePathByNormalizedName(canonicalProjectName);
        }

        if (resolvedPath == null) {
            resolvedPath = resolvePrimaryProjectsDir().resolve(canonicalProjectName + SQLITE_EXTENSION).normalize();
        }

        return resolvedPath;
    }

    private String canonicalizeProjectName(String value) {
        String safeValue = value == null ? "" : value;
        return Normalizer.normalize(safeValue, Normalizer.Form.NFC).trim();
    }

    private String normalizeProjectLookupKey(String value) {
        String normalized = sanitizeProjectName(value);
        return normalized.trim().toLowerCase(Locale.ROOT);
    }

    private String foldProjectLookupKey(String value) {
        String normalized = sanitizeProjectName(value);
        String decomposed = Normalizer.normalize(normalized, Normalizer.Form.NFD);
        String withoutDiacritics = DIACRITICS_PATTERN.matcher(decomposed).replaceAll("");
        return Normalizer.normalize(withoutDiacritics, Normalizer.Form.NFC)
                .trim()
                .toLowerCase(Locale.ROOT);
    }

    private boolean looksLikeMojibake(String value) {
        String safeValue = value == null ? "" : value;
        return safeValue.contains("Ã") || safeValue.contains("Â") || safeValue.contains("Ð") || safeValue.contains("Ñ") || safeValue.contains("â");
    }

    private String repairMojibake(String value) {
        String safeValue = value == null ? "" : value;
        String repaired = new String(safeValue.getBytes(StandardCharsets.ISO_8859_1), StandardCharsets.UTF_8);
        return repaired;
    }

    private String sanitizeProjectName(String value) {
        String canonicalName = canonicalizeProjectName(value);
        String sanitizedName = canonicalName;

        if (looksLikeMojibake(canonicalName)) {
            String repaired = repairMojibake(canonicalName);
            String canonicalRepaired = canonicalizeProjectName(repaired);
            if (!canonicalRepaired.isEmpty()) {
                sanitizedName = canonicalRepaired;
            }
        }

        return sanitizedName;
    }

    private Path repairBackupFilenameIfNeeded(Path sqliteFile) {
        Path resolvedPath = sqliteFile;

        if (sqliteFile != null && sqliteFile.getFileName() != null) {
            String filename = sqliteFile.getFileName().toString();
            if (filename.endsWith(SQLITE_EXTENSION)) {
                String basename = filename.substring(0, filename.length() - SQLITE_EXTENSION.length());
                String sanitizedBasename = sanitizeProjectName(basename);
                boolean shouldRename = looksLikeMojibake(basename) && !sanitizedBasename.equals(basename);

                if (shouldRename) {
                    Path parentDir = sqliteFile.getParent();
                    if (parentDir != null) {
                        Path repairedPath = parentDir.resolve(sanitizedBasename + SQLITE_EXTENSION).normalize();
                        boolean targetAlreadyExists = Files.exists(repairedPath);
                        if (!targetAlreadyExists) {
                            try {
                                resolvedPath = Files.move(sqliteFile, repairedPath);
                            } catch (IOException ignored) {
                                resolvedPath = sqliteFile;
                            }
                        } else {
                            resolvedPath = repairedPath;
                        }
                    }
                }
            }
        }

        return resolvedPath;
    }

    private Path findDatabasePathByNormalizedName(String projectName) {
        Path resolvedPath = null;
        String targetKey = normalizeProjectLookupKey(projectName);
        String targetFoldedKey = foldProjectLookupKey(projectName);

        for (Path dir : getCandidateBackupDirs()) {
            if (Files.exists(dir) && Files.isDirectory(dir)) {
                try (var stream = Files.list(dir)) {
                    List<Path> sqliteFiles = stream
                            .filter(p -> p.toString().endsWith(SQLITE_EXTENSION))
                            .collect(Collectors.toList());

                    for (Path scannedFile : sqliteFiles) {
                        Path sqliteFile = repairBackupFilenameIfNeeded(scannedFile);
                        String filename = sqliteFile.getFileName().toString();
                        String basename = filename.substring(0, filename.length() - SQLITE_EXTENSION.length());
                        String candidateKey = normalizeProjectLookupKey(basename);
                        String candidateFoldedKey = foldProjectLookupKey(basename);
                        if (candidateKey.equals(targetKey) || candidateFoldedKey.equals(targetFoldedKey)) {
                            resolvedPath = sqliteFile.normalize();
                            break;
                        }
                    }
                } catch (IOException ignored) {
                    // Si no se puede inspeccionar este directorio, probar el siguiente.
                }
            }

            if (resolvedPath != null) {
                break;
            }
        }

        return resolvedPath;
    }

    private ResponseEntity<Resource> buildDownloadResponse(String projectName) {
        ResponseEntity<Resource> response;
        try {
            Path filePath = resolveDatabasePathForRead(projectName);
            @SuppressWarnings("null")
            Resource resource = (Resource) new UrlResource(filePath.toUri());

            if (resource.exists()) {
                @SuppressWarnings("null")
                MediaType mediaType = (MediaType) MediaType.APPLICATION_OCTET_STREAM;
                response = ResponseEntity.ok()
                        .contentType(mediaType)
                        .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + resource.getFilename() + "\"")
                        .body(resource);
            } else {
                response = ResponseEntity.notFound().build();
            }
        } catch (MalformedURLException e) {
            response = ResponseEntity.badRequest().build();
        }
        return response;
    }

    public DatabaseController(@Qualifier("dbTaskExecutor") Executor dbTaskExecutor) {
        this.dbTaskExecutor = dbTaskExecutor;
        Path dir = resolvePrimaryProjectsDir();
        if (!Files.exists(dir)) {
            try {
                Files.createDirectories(dir);
            } catch (IOException ignored) {
                // Best-effort; endpoints will report concrete IO errors.
            }
        }
    }

    @GetMapping("/list")
    public List<String> listDatabases() throws IOException {
        List<Path> scannedFiles = new ArrayList<>();

        for (Path dir : getCandidateBackupDirs()) {
            if (Files.exists(dir) && Files.isDirectory(dir)) {
                try (var stream = Files.list(dir)) {
                    scannedFiles.addAll(
                            stream
                                    .filter(p -> p.toString().endsWith(SQLITE_EXTENSION))
                                    .collect(Collectors.toList())
                    );
                }
            }
        }

        Map<String, String> normalizedNames = new LinkedHashMap<>();
        for (Path rawScannedFile : scannedFiles) {
            Path scannedFile = repairBackupFilenameIfNeeded(rawScannedFile);
            String filename = scannedFile.getFileName().toString();
            String basename = filename.substring(0, filename.length() - SQLITE_EXTENSION.length());
            String canonicalName = sanitizeProjectName(basename);
            String lookupKey = normalizeProjectLookupKey(canonicalName);
            normalizedNames.putIfAbsent(lookupKey, canonicalName);
        }

        List<String> databases = new ArrayList<>(normalizedNames.values());
        databases.sort(String.CASE_INSENSITIVE_ORDER);

        return databases;
    }

    @GetMapping("/download/{projectName}")
    public ResponseEntity<Resource> downloadDatabase(@PathVariable String projectName) {
        return buildDownloadResponse(projectName);
    }

    @GetMapping("/download")
    public ResponseEntity<Resource> downloadDatabaseByQuery(@RequestParam("projectName") String projectName) {
        return buildDownloadResponse(projectName);
    }

    @PostMapping("/upload/{projectName}")
    public ResponseEntity<String> uploadDatabase(@PathVariable String projectName, @RequestParam("file") MultipartFile file) {
        ResponseEntity<String> response;

        if (file.isEmpty()) {
            response = ResponseEntity.badRequest().body("File is empty");
        } else {
            try {
                String canonicalProjectName = sanitizeProjectName(projectName);
                Path projectsDir = resolvePrimaryProjectsDir();
                if (!Files.exists(projectsDir)) {
                    Files.createDirectories(projectsDir);
                }
                Path targetPath = projectsDir.resolve(canonicalProjectName + SQLITE_EXTENSION);
                Files.copy(file.getInputStream(), targetPath, java.nio.file.StandardCopyOption.REPLACE_EXISTING);
                response = ResponseEntity.ok("Database '" + canonicalProjectName + "' uploaded successfully");
            } catch (IOException e) {
                response = ResponseEntity.internalServerError().body("Failed to upload: " + e.getMessage());
            }
        }
        return response;
    }

    @PostMapping("/upload")
    public ResponseEntity<String> uploadDatabaseByQuery(
            @RequestParam("projectName") String projectName,
            @RequestParam("file") MultipartFile file
    ) {
        return uploadDatabase(projectName, file);
    }

    @GetMapping("/export/{projectName}")
    public ResponseEntity<Resource> exportProjectZip(@PathVariable String projectName) {
        ResponseEntity<Resource> response;
        try {
            Path dbPath = resolveDatabasePathForRead(projectName);
            if (!Files.exists(dbPath)) {
                response = ResponseEntity.notFound().build();
            } else {
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

                response = ResponseEntity.ok()
                        .contentType(mediaType)
                        .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + projectName + ".zip\"")
                        .body(resource);
            }

        } catch (IOException e) {
            response = ResponseEntity.internalServerError().build();
        }
        return response;
    }

    @PostMapping("/import/{projectName}")
    public ResponseEntity<Resource> importProjectZip(
            @PathVariable String projectName,
            @RequestParam("file") MultipartFile file) {
        ResponseEntity<Resource> response;

        if (file.isEmpty()) {
            response = ResponseEntity.badRequest().build();
        } else {
            try {
                String canonicalProjectName = sanitizeProjectName(projectName);
                Path projectsPath = resolvePrimaryProjectsDir();
                Path assetsPath = Paths.get("maps_assets");
                if (!Files.exists(projectsPath)) Files.createDirectories(projectsPath);
                if (!Files.exists(assetsPath)) Files.createDirectories(assetsPath);

                Path finalDbPath = projectsPath.resolve(canonicalProjectName + SQLITE_EXTENSION);

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
                    response = ResponseEntity.ok()
                            .contentType(MediaType.APPLICATION_OCTET_STREAM)
                            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + canonicalProjectName + SQLITE_EXTENSION + "\"")
                            .body(resource);
                } else {
                    response = ResponseEntity.internalServerError().build();
                }

            } catch (IOException e) {
                response = ResponseEntity.internalServerError().build();
            }
        }
        return response;
    }

    @PostMapping("/import/async/{projectName}")
    public ResponseEntity<ImportJobResponse> importProjectZipAsync(
            @PathVariable String projectName,
            @RequestParam("file") MultipartFile file) {
        ResponseEntity<ImportJobResponse> response;

        if (file.isEmpty()) {
            response = ResponseEntity.badRequest().body(
                    new ImportJobResponse(null, "error", "El archivo ZIP está vacío.")
            );
        } else {
            try {
                byte[] zipBytes = file.getBytes();
                String jobId = UUID.randomUUID().toString();
                String canonicalProjectName = sanitizeProjectName(projectName);
                ImportJobState state = new ImportJobState(jobId, canonicalProjectName);
                importJobs.put(jobId, state);

                CompletableFuture.runAsync(() -> processImportJob(jobId, canonicalProjectName, zipBytes), dbTaskExecutor);

                response = ResponseEntity.accepted().body(
                        new ImportJobResponse(jobId, "queued", "Importación iniciada en segundo plano.")
                );
            } catch (IOException e) {
                response = ResponseEntity.internalServerError().body(
                        new ImportJobResponse(null, "error", "No se pudo leer el archivo ZIP.")
                );
            }
        }

        return response;
    }

    @GetMapping("/import/status/{jobId}")
    public ResponseEntity<ImportJobState> getImportJobStatus(@PathVariable String jobId) {
        ResponseEntity<ImportJobState> response;
        ImportJobState state = importJobs.get(jobId);

        if (state == null) {
            response = ResponseEntity.notFound().build();
        } else {
            response = ResponseEntity.ok(state);
        }
        return response;
    }

    @GetMapping("/import/result/{jobId}")
    public ResponseEntity<Resource> getImportJobResult(@PathVariable String jobId) {
        ResponseEntity<Resource> response;
        ImportJobState state = importJobs.get(jobId);

        if (state == null) {
            response = ResponseEntity.notFound().build();
        } else if (!"completed".equals(state.status)) {
            response = ResponseEntity.status(202).build();
        } else {
            response = buildDownloadResponse(state.projectName);
        }

        return response;
    }

    private void processImportJob(String jobId, String projectName, byte[] zipBytes) {
        ImportJobState state = importJobs.get(jobId);
        if (state == null) {
            return;
        }

        try {
            state.status = "running";
            state.progress = 10;
            state.message = "Preparando importación...";

            Path projectsPath = resolvePrimaryProjectsDir();
            Path assetsPath = Paths.get("maps_assets");
            if (!Files.exists(projectsPath)) {
                Files.createDirectories(projectsPath);
            }
            if (!Files.exists(assetsPath)) {
                Files.createDirectories(assetsPath);
            }

            String canonicalProjectName = sanitizeProjectName(projectName);
            Path finalDbPath = projectsPath.resolve(canonicalProjectName + SQLITE_EXTENSION);
            int totalEntries = countZipEntries(zipBytes);
            int processedEntries = 0;

            state.progress = 20;
            state.message = "Procesando contenido del ZIP...";

            try (java.util.zip.ZipInputStream zis = new java.util.zip.ZipInputStream(new ByteArrayInputStream(zipBytes))) {
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

                    processedEntries += 1;
                    int progressWithinZip = totalEntries > 0
                            ? Math.round((processedEntries * 70.0f) / totalEntries)
                            : 70;
                    state.progress = Math.min(95, 20 + progressWithinZip);
                    state.message = "Importando archivos del respaldo...";
                }
            }

            if (Files.exists(finalDbPath)) {
                state.status = "completed";
                state.progress = 100;
                state.message = "Importación completada.";
                state.error = null;
            } else {
                state.status = "failed";
                state.progress = 100;
                state.message = "Falló la importación.";
                state.error = "No se encontró un archivo .sqlite válido en el ZIP.";
            }
        } catch (IOException e) {
            state.status = "failed";
            state.progress = 100;
            state.message = "Falló la importación.";
            state.error = e.getMessage();
        }
    }

    private int countZipEntries(byte[] zipBytes) throws IOException {
        int count = 0;
        try (java.util.zip.ZipInputStream zis = new java.util.zip.ZipInputStream(new ByteArrayInputStream(zipBytes))) {
            while (zis.getNextEntry() != null) {
                count += 1;
            }
        }
        return count;
    }
}
