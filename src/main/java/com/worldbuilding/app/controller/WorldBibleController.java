package com.worldbuilding.app.controller;

import com.worldbuilding.app.model.*;
import com.worldbuilding.app.repository.*;
import com.worldbuilding.app.service.WorldBibleService;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/world-bible")
public class WorldBibleController {

    @Autowired
    private WorldBibleService worldBibleService;

    @Autowired
    private CuadernoRepository cuadernoRepository;

    @Autowired
    private CarpetaRepository carpetaRepository;

    @Autowired
    private EntidadGenericaRepository entidadGenericaRepository;

    private Cuaderno getProyectoActual(HttpSession session) {
        String nombreProyecto = (String) session.getAttribute("proyectoActivo");
        if (nombreProyecto == null)
            return null;
        List<Cuaderno> cuadernos = cuadernoRepository.findByNombreProyecto(nombreProyecto);
        return cuadernos.isEmpty() ? null : cuadernos.get(0);
    }

    @GetMapping("/folders")
    public ResponseEntity<?> getRootFolders(HttpSession session) {
        Cuaderno proyecto = getProyectoActual(session);
        if (proyecto == null)
            return ResponseEntity.status(401).body(Map.of("error", "No active project"));
        return ResponseEntity.ok(worldBibleService.getRootFolders(proyecto));
    }

    @GetMapping("/folders/{id}/subfolders")
    public ResponseEntity<?> getSubfolders(@PathVariable Long id) {
        return ResponseEntity.ok(worldBibleService.getSubfolders(id));
    }

    @GetMapping("/folders/{id}/entities")
    public ResponseEntity<?> getEntitiesInFolder(@PathVariable Long id) {
        Optional<Carpeta> carpeta = carpetaRepository.findById(id);
        if (carpeta.isEmpty())
            return ResponseEntity.notFound().build();
        return ResponseEntity.ok(entidadGenericaRepository.findByCarpeta(carpeta.get()));
    }

    @PostMapping("/folders")
    public ResponseEntity<?> createFolder(@RequestBody Map<String, Object> payload, HttpSession session) {
        Cuaderno proyecto = getProyectoActual(session);
        if (proyecto == null)
            return ResponseEntity.status(401).body(Map.of("error", "No active project"));

        String nombre = (String) payload.get("nombre");
        Number padreId = (Number) payload.get("padreId");

        return ResponseEntity
                .ok(worldBibleService.createFolder(nombre, proyecto, padreId != null ? padreId.longValue() : null));
    }

    @PostMapping("/entities")
    public ResponseEntity<?> createEntity(@RequestBody Map<String, Object> payload, HttpSession session) {
        Cuaderno proyecto = getProyectoActual(session);
        if (proyecto == null)
            return ResponseEntity.status(401).body(Map.of("error", "No active project"));

        String nombre = (String) payload.get("nombre");
        Number carpetaId = (Number) payload.get("carpetaId");
        String tipoEspecial = (String) payload.get("tipoEspecial");

        try {
            return ResponseEntity
                    .ok(worldBibleService.createEntity(nombre, proyecto, carpetaId.longValue(), tipoEspecial));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/entities/{id}")
    public ResponseEntity<?> getEntity(@PathVariable Long id) {
        return ResponseEntity.of(entidadGenericaRepository.findById(id));
    }

    @PatchMapping("/entities/{id}/values")
    public ResponseEntity<?> updateValues(@PathVariable Long id,
            @RequestBody List<WorldBibleService.ValueUpdateDTO> updates) {
        try {
            worldBibleService.updateEntityValues(id, updates);
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/folders/{id}/templates")
    public ResponseEntity<?> createTemplate(@PathVariable Long id, @RequestBody Map<String, Object> payload) {
        try {
            String nombre = (String) payload.get("nombre");
            String tipo = (String) payload.get("tipo");
            String metadata = (String) payload.get("metadata"); // JSON string or null
            Boolean required = (Boolean) payload.get("required");

            return ResponseEntity.ok(
                    worldBibleService.createTemplate(id, nombre, tipo, metadata, required != null ? required : false));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/folders/{id}/templates")
    public ResponseEntity<?> getTemplates(@PathVariable Long id) {
        Optional<Carpeta> carpeta = carpetaRepository.findById(id);
        if (carpeta.isEmpty())
            return ResponseEntity.notFound().build();
        return ResponseEntity.ok(worldBibleService.getAllInheritedTemplates(carpeta.get()));
    }

    @PostMapping("/entities/{id}/attributes")
    public ResponseEntity<?> addAttribute(@PathVariable Long id, @RequestBody Map<String, Long> payload) {
        try {
            Long plantillaId = payload.get("plantillaId");
            return ResponseEntity.ok(worldBibleService.addAttributeToEntity(id, plantillaId));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
