package com.worldbuilding.app.controller;

import com.worldbuilding.app.config.TenantContext;
import com.worldbuilding.app.model.Cuaderno;
import com.worldbuilding.app.repository.CuadernoRepository;
import com.worldbuilding.app.service.ProjectDiscoveryService;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/proyectos")
public class ProyectoController {

    private static final String PROYECTO_ACTIVO = "proyectoActivo";
    private static final org.slf4j.Logger logger = org.slf4j.LoggerFactory.getLogger(ProyectoController.class);

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
        try {
            // 1. Validate if project file exists (Security check to avoid creating random
            // DBs)
            List<String> projects = projectDiscoveryService.listProjects();
            if (!projects.contains(identifier)) {
                return ResponseEntity.status(404).body(Map.of("error", "Project file not found: " + identifier));
            }

            // 2. Set Tenant Context to read from that DB
            TenantContext.setCurrentTenant(identifier);

            // 3. Find the Cuaderno record (Deterministic Root Resolution)
            Optional<Cuaderno> cuaderno = cuadernoRepository.findAll().stream()
                    .filter(c -> c != null && c.getId() != null) // SAFETY: Filter out broken records
                    .sorted(Comparator.comparing(Cuaderno::getId))
                    .findFirst();

            // 4. Set Session (IMPORTANT: Do this BEFORE returning)
            session.setAttribute(PROYECTO_ACTIVO, identifier);

            if (cuaderno.isEmpty()) {
                // Self-Healing
                logger.warn(
                        ">>> [ProyectoController] Metadata record missing for '" + identifier + "'. Self-healing...");
                Cuaderno def = new Cuaderno();
                def.setTitulo(identifier);
                def.setNombreProyecto(identifier);
                def.setDescripcion("Auto-recovered world context.");
                Cuaderno saved = cuadernoRepository.save(def);

                return ResponseEntity.ok(Map.of(
                        "success", true,
                        "nombreProyecto", saved.getNombreProyecto(),
                        "id", saved.getId(),
                        "warning", "Self-healed"));
            }

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "nombreProyecto",
                    cuaderno.get().getNombreProyecto() != null ? cuaderno.get().getNombreProyecto() : identifier,
                    "id", cuaderno.get().getId()));

        } catch (Exception e) {
            e.printStackTrace();
            String msg = e.getMessage() != null ? e.getMessage() : e.toString();
            String trace = (e.getStackTrace() != null && e.getStackTrace().length > 0) ? e.getStackTrace()[0].toString()
                    : "No trace";
            return ResponseEntity.status(500).body(Map.of("error", msg, "trace", trace));
        } finally {
            // Context will be cleared by Interceptor
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
