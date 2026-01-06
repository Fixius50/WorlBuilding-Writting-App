package com.worldbuilding.app.controller;

import com.worldbuilding.app.config.TenantContext;
import com.worldbuilding.app.model.Cuaderno;
import com.worldbuilding.app.repository.CuadernoRepository;
import com.worldbuilding.app.service.ProjectDiscoveryService;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/proyectos")
public class ProyectoController {

    private static final String PROYECTO_ACTIVO = "proyectoActivo";

    @Autowired
    private CuadernoRepository cuadernoRepository;

    @Autowired
    private ProjectDiscoveryService projectDiscoveryService;

    /**
     * Abre un proyecto existente (lo establece en sesión)
     * Logic: Check if DB file exists -> Set Context -> Fetch Info -> Set Session
     */
    @GetMapping("/{identifier}")
    public ResponseEntity<?> abrirProyecto(@PathVariable String identifier, HttpSession session) {
        // 1. Validate if project file exists (Security check to avoid creating random
        // DBs)
        List<String> projects = projectDiscoveryService.listProjects();
        if (!projects.contains(identifier)) {
            return ResponseEntity.status(404).body(Map.of("error", "Project file not found: " + identifier));
        }

        // 2. Set Tenant Context to read from that DB
        TenantContext.setCurrentTenant(identifier);

        try {
            // 3. Find the Cuaderno record (Should be only 1)
            Optional<Cuaderno> cuaderno = cuadernoRepository.findAll().stream().findFirst();

            // 4. Set Session (IMPORTANT: Do this BEFORE returning)
            session.setAttribute(PROYECTO_ACTIVO, identifier);

            if (cuaderno.isEmpty()) {
                // If DB exists but no record, return success with default data to avoid
                // blocking the UI
                return ResponseEntity.ok(Map.of(
                        "success", true,
                        "nombreProyecto", identifier,
                        "id", -1L,
                        "warning", "Metadata record missing, using defaults"));
            }

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "nombreProyecto", cuaderno.get().getNombreProyecto(),
                    "id", cuaderno.get().getId()));

        } finally {
            // Context will be cleared by Interceptor, but good practice to allow current
            // request to finish?
            // Actually, Interceptor clears it AFTER request.
            // But if I change it here, does it affect View rendering?
            // This is REST, so JSON return.
            // If I clear it, subsequent Lazy loading might fail?
            // No lazy loading in this simple return.
        }
    }

    /**
     * Obtiene el proyecto activo de la sesión
     */
    @GetMapping("/activo")
    public ResponseEntity<?> obtenerProyectoActivo(HttpSession session) {
        String nombreProyecto = (String) session.getAttribute(PROYECTO_ACTIVO);

        if (nombreProyecto == null) {
            return ResponseEntity.status(404).body(Map.of("error", "No hay proyecto activo"));
        }

        return ResponseEntity.ok(Map.of(
                "nombreProyecto", nombreProyecto,
                "activo", true));
    }

    @PostMapping("/cerrar")
    public ResponseEntity<?> cerrarProyecto(HttpSession session) {
        session.removeAttribute(PROYECTO_ACTIVO);
        TenantContext.clear();
        return ResponseEntity.ok(Map.of("success", true, "mensaje", "Proyecto cerrado"));
    }
}
