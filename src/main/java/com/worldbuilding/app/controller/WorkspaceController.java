package com.worldbuilding.app.controller;

import com.worldbuilding.app.model.Cuaderno;
import com.worldbuilding.app.model.Usuario;
import com.worldbuilding.app.repository.CuadernoRepository;
import com.worldbuilding.app.repository.UsuarioRepository;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/workspaces")
public class WorkspaceController {

    @Autowired
    private CuadernoRepository cuadernoRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @GetMapping
    public ResponseEntity<?> listWorkspaces() {
        List<Cuaderno> projects = cuadernoRepository.findAll();

        List<Map<String, Object>> workspaces = projects.stream().map(project -> {
            Map<String, Object> ws = new HashMap<>();
            ws.put("id", project.getId());
            ws.put("title", project.getTitulo());
            ws.put("projectName", project.getNombreProyecto());
            ws.put("description", project.getDescripcion());
            ws.put("type", project.getTipo());
            ws.put("genre", project.getGenero());
            ws.put("created", project.getFechaCreacion().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));

            // Get owner info
            if (project.getUsuarioId() != null) {
                usuarioRepository.findById(project.getUsuarioId())
                        .ifPresent(u -> ws.put("owner", u.getUsername()));
            } else {
                ws.put("owner", "Unknown");
            }

            return ws;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(workspaces);
    }

    @PostMapping("/select")
    public ResponseEntity<?> selectWorkspace(@RequestBody Map<String, Long> payload, HttpSession session) {
        Long projectId = payload.get("projectId");
        if (projectId == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Project ID is required"));
        }

        Optional<Cuaderno> projectOpt = cuadernoRepository.findById(projectId);
        if (projectOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Cuaderno project = projectOpt.get();

        // Find owner to set as current user session
        Usuario owner = null;
        if (project.getUsuarioId() != null) {
            owner = usuarioRepository.findById(project.getUsuarioId()).orElse(null);
        }

        if (owner == null) {
            // Fallback if no owner found (shouldn't happen in normal flow but safe to
            // handle)
            return ResponseEntity.status(500).body(Map.of("error", "Workspace has no valid owner"));
        }

        // Set Session Context
        session.setAttribute("user", owner);
        session.setAttribute("proyectoActivo", project.getNombreProyecto());

        return ResponseEntity.ok(Map.of(
                "success", true,
                "username", owner.getUsername(),
                "projectName", project.getNombreProyecto(),
                "redirect", "/" + owner.getUsername() + "/" + project.getNombreProyecto()));
    }
}
