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

    @GetMapping
    public List<String> listWorkspaces() {
        return projectDiscoveryService.listProjects();
    }

    @PostMapping
    public ResponseEntity<?> createWorkspace(@RequestBody Map<String, String> payload) {
        String name = payload.get("name");
        if (name == null || name.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Name is required"));
        }
        try {
            projectDiscoveryService.createProject(name);
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
}
