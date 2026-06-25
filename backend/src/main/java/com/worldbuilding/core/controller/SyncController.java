package com.worldbuilding.core.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.File;
import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/sync")
@CrossOrigin(origins = "*")
public class SyncController {

    private static final String BACKUPS_DIR = "backup";
    private static final String SAFE_NAME_PATTERN = "^[a-zA-Z0-9._-]+$";
    private final ObjectMapper objectMapper;

    private Path resolvePrimaryBackupDir() {
        return Paths.get(BACKUPS_DIR);
    }

    public SyncController() {
        this.objectMapper = new ObjectMapper().enable(SerializationFeature.INDENT_OUTPUT);
        Path[] dirsToPrepare = new Path[]{
            resolvePrimaryBackupDir()
        };

        for (Path dirPath : dirsToPrepare) {
            File dir = dirPath.toFile();
            if (!dir.exists()) {
                dir.mkdirs();
            }
        }
    }

    @PostMapping("/payload/{projectName}")
    public ResponseEntity<Map<String, Object>> archivePayload(
            @PathVariable String projectName,
            @RequestBody Map<String, Object> payload
    ) {
        ResponseEntity<Map<String, Object>> response;

        if (!projectName.matches(SAFE_NAME_PATTERN)) {
            response = ResponseEntity.badRequest().body(buildResponse(false, "projectName inválido.", null));
        } else {
            try {
                Path filePath = resolvePrimaryBackupDir().resolve(projectName + ".sync.json").normalize();
                objectMapper.writeValue(filePath.toFile(), payload);
                response = ResponseEntity.ok(buildResponse(true, "Payload archivado correctamente.", filePath.toString()));
            } catch (IOException exception) {
                response = ResponseEntity.internalServerError().body(buildResponse(false, "No se pudo archivar payload: " + exception.getMessage(), null));
            }
        }
        return response;
    }

    private Map<String, Object> buildResponse(boolean success, String message, String filePath) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", success);
        response.put("message", message);
        if (filePath != null) {
            response.put("filePath", filePath);
        }
        return response;
    }
}
