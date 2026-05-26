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
@RequestMapping("/api/sync")
@CrossOrigin(origins = "*")
public class SyncController {

    private static final String PROJECTS_DIR = "projects";
    private static final String SAFE_NAME_PATTERN = "^[a-zA-Z0-9._-]+$";
    private final ObjectMapper objectMapper;

    public SyncController() {
        this.objectMapper = new ObjectMapper().enable(SerializationFeature.INDENT_OUTPUT);
        File dir = new File(PROJECTS_DIR);
        if (!dir.exists()) {
            dir.mkdirs();
        }
    }

    @PostMapping("/payload/{projectName}")
    public ResponseEntity<Map<String, Object>> archivePayload(
            @PathVariable String projectName,
            @RequestBody Map<String, Object> payload
    ) {
        if (!projectName.matches(SAFE_NAME_PATTERN)) {
            return ResponseEntity.badRequest().body(buildResponse(false, "projectName inválido.", null));
        }

        try {
            Path filePath = Paths.get(PROJECTS_DIR).resolve(projectName + ".sync.json").normalize();
            objectMapper.writeValue(filePath.toFile(), payload);
            return ResponseEntity.ok(buildResponse(true, "Payload archivado correctamente.", filePath.toString()));
        } catch (IOException exception) {
            return ResponseEntity.internalServerError().body(buildResponse(false, "No se pudo archivar payload: " + exception.getMessage(), null));
        }
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
