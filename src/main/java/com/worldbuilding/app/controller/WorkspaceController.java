package com.worldbuilding.app.controller;

import com.worldbuilding.app.service.ProjectDiscoveryService;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/workspaces")
public class WorkspaceController {

    @Autowired
    private ProjectDiscoveryService projectDiscoveryService;

    public List<com.worldbuilding.app.dto.ProjectMetadataDTO> listWorkspaces() {
        return projectDiscoveryService.listProjectsFull().stream()
                .filter(p -> !p.getFilename().equalsIgnoreCase("worldbuilding"))
                .collect(java.util.stream.Collectors.toList());
    }

    @PostMapping
    public ResponseEntity<?> createWorkspace(@RequestBody Map<String, String> payload) {
        String name = payload.get("name");
        String title = payload.get("title");
        String genre = payload.get("genre");
        String imageUrl = payload.get("imageUrl");

        if (name == null || name.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Name is required"));
        }
        try {
            projectDiscoveryService.createProject(name, title, genre, imageUrl);
            return ResponseEntity.ok(Map.of("success", true, "name", name));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/select")
    public ResponseEntity<?> selectWorkspace(@RequestBody Map<String, String> payload, HttpSession session) {
        String projectName = payload.get("projectName");
        if (projectName == null || projectName.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Project Name is required"));
        }

        // Set Session Context
        session.setAttribute("proyectoActivo", projectName);

        // Redirect to /local/ProjectName (using 'local' as generic user placeholder)
        return ResponseEntity.ok(Map.of(
                "success", true,
                "projectName", projectName,
                "redirect", "/local/" + projectName));
    }

    @DeleteMapping("/{name}")
    public ResponseEntity<?> deleteWorkspace(@PathVariable String name) {
        try {
            projectDiscoveryService.deleteProject(name);
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{name}")
    public ResponseEntity<?> updateWorkspace(@PathVariable String name, @RequestBody Map<String, String> payload) {
        try {
            String title = payload.get("title");
            String genre = payload.get("genre");
            String imageUrl = payload.get("imageUrl");

            projectDiscoveryService.updateProjectMetadata(name, title, genre, imageUrl);
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }
}
