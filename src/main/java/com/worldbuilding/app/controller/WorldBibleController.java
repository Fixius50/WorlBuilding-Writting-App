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

    @GetMapping("/folders/{idOrSlug}")
    public ResponseEntity<?> getFolder(@PathVariable String idOrSlug) {
        if (isNumeric(idOrSlug)) {
            return carpetaRepository.findById(Long.parseLong(idOrSlug))
                    .map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        } else {
            return carpetaRepository.findBySlug(idOrSlug)
                    .map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        }
    }

    private boolean isNumeric(String str) {
        if (str == null)
            return false;
        try {
            Long.parseLong(str);
            return true;
        } catch (NumberFormatException e) {
            return false;
        }
    }

    /*
     * - [x] Renombrar "Estructura/Zona" a "Espacio".
     * - [x] Corrección Root Index: Eliminar botones "Character/Map/Timeline" y usar
     * Modal para "Espacio/Mapa".
     * - [ ] **Refactorización Flujo de Creación (Sin Prompts)**
     * - [ ] Restaurar Explorador Lateral (Solo Carpeta).
     * - [ ] Rutas de Creación Directa (e.g., `/new/:type`).
     * - [ ] Refactor `EntityBuilder` para modo "Creación".
     * - [ ] Implementar guardado diferido (Post-draft).
     * - [ ] Soporte para Herencia de Plantillas en modo borrador.
     */
    @GetMapping("/folders/{idOrSlug}/subfolders")
    public ResponseEntity<?> getSubfolders(@PathVariable String idOrSlug) {
        Long id = resolveFolderId(idOrSlug);
        if (id == null)
            return ResponseEntity.notFound().build();
        return ResponseEntity.ok(worldBibleService.getSubfolders(id));
    }

    private Long resolveFolderId(String idOrSlug) {
        if (isNumeric(idOrSlug))
            return Long.parseLong(idOrSlug);
        return carpetaRepository.findBySlug(idOrSlug).map(Carpeta::getId).orElse(null);
    }

    @GetMapping("/folders/{idOrSlug}/entities")
    public ResponseEntity<?> getEntitiesInFolder(@PathVariable String idOrSlug) {
        Long id = resolveFolderId(idOrSlug);
        if (id == null)
            return ResponseEntity.notFound().build();

        Optional<Carpeta> carpeta = carpetaRepository.findById(id);
        if (carpeta.isEmpty())
            return ResponseEntity.notFound().build();
        return ResponseEntity.ok(entidadGenericaRepository.findByCarpeta(carpeta.get()));
    }

    @PostMapping("/folders")
    public ResponseEntity<?> createFolder(@RequestBody Map<String, Object> payload, HttpSession session) {
        System.out.println("[DEBUG] createFolder called");
        System.out.println("[DEBUG] Session ID: " + session.getId());
        System.out.println("[DEBUG] proyectoActivo: " + session.getAttribute("proyectoActivo"));

        Cuaderno proyecto = getProyectoActual(session);
        if (proyecto == null) {
            System.out.println("[DEBUG] proyecto is NULL - returning 401");
            return ResponseEntity.status(401).body(Map.of("error", "No active project"));
        }

        String nombre = (String) payload.get("nombre");
        String descripcion = (String) payload.get("descripcion");
        Number padreId = (Number) payload.get("padreId");
        String tipo = (String) payload.get("tipo");

        return ResponseEntity
                .ok(worldBibleService.createFolder(nombre, descripcion, proyecto,
                        padreId != null ? padreId.longValue() : null, tipo));
    }

    @PutMapping("/folders/{id}")
    public ResponseEntity<?> renameFolder(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        try {
            String newName = payload.get("nombre");
            return ResponseEntity.ok(worldBibleService.renameFolder(id, newName));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/folders/{id}")
    public ResponseEntity<?> deleteFolder(@PathVariable Long id) {
        try {
            worldBibleService.deleteFolder(id);
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/entities")
    public ResponseEntity<?> createEntity(@RequestBody Map<String, Object> payload, HttpSession session) {
        Cuaderno proyecto = getProyectoActual(session);
        if (proyecto == null)
            return ResponseEntity.status(401).body(Map.of("error", "No active project"));

        String nombre = (String) payload.get("nombre");
        Number carpetaId = (Number) payload.get("carpetaId");
        String tipoEspecial = (String) payload.get("tipoEspecial");
        String descripcion = (String) payload.get("descripcion");
        String iconUrl = (String) payload.get("iconUrl");

        try {
            return ResponseEntity
                    .ok(worldBibleService.createEntity(nombre, proyecto, carpetaId.longValue(), tipoEspecial,
                            descripcion, iconUrl));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/entities")
    public ResponseEntity<?> getAllEntities(HttpSession session) {
        Cuaderno proyecto = getProyectoActual(session);
        if (proyecto == null)
            return ResponseEntity.status(401).body(Map.of("error", "No active project"));

        return ResponseEntity.ok(entidadGenericaRepository.findByProyecto(proyecto));
    }

    @GetMapping("/entities/{idOrSlug}")
    public ResponseEntity<?> getEntity(@PathVariable String idOrSlug, HttpSession session) {
        Cuaderno proyecto = getProyectoActual(session);
        if (proyecto == null)
            return ResponseEntity.status(401).body(Map.of("error", "No active project"));

        if (isNumeric(idOrSlug)) {
            return entidadGenericaRepository.findById(Long.parseLong(idOrSlug))
                    .map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        } else {
            return entidadGenericaRepository.findBySlug(idOrSlug)
                    .map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        }
    }

    @DeleteMapping("/entities/{id}")
    public ResponseEntity<?> deleteEntity(@PathVariable Long id, HttpSession session) {
        Cuaderno proyecto = getProyectoActual(session);
        if (proyecto == null)
            return ResponseEntity.status(401).body(Map.of("error", "No active project"));

        Optional<EntidadGenerica> ent = entidadGenericaRepository.findById(id);
        if (ent.isEmpty())
            return ResponseEntity.notFound().build();

        if (!ent.get().getProyecto().getId().equals(proyecto.getId())) {
            return ResponseEntity.status(403).body(Map.of("error", "Access denied"));
        }

        entidadGenericaRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("success", true));
    }

    public ResponseEntity<?> getEntity(@PathVariable Long id) {
        return ResponseEntity.of(entidadGenericaRepository.findById(id));
    }

    @PatchMapping("/entities/{entityId}/values")
    public ResponseEntity<?> updateEntityValues(@PathVariable Long entityId,
            @RequestBody List<WorldBibleService.ValueUpdateDTO> updates) {
        worldBibleService.updateEntityValues(entityId, updates);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/entities/{entityId}/details")
    public ResponseEntity<EntidadGenerica> updateEntityDetails(@PathVariable Long entityId,
            @RequestBody Map<String, Object> payload) {
        String descripcion = (String) payload.get("descripcion");
        String tags = (String) payload.get("tags");
        return ResponseEntity.ok(worldBibleService.updateEntityDetails(entityId, descripcion, tags));
    }

    @PostMapping("/folders/{id}/templates")
    public ResponseEntity<?> createTemplate(@PathVariable Long id, @RequestBody Map<String, Object> payload) {
        try {
            String nombre = (String) payload.get("nombre");
            String tipo = (String) payload.get("tipo");
            String metadata = (String) payload.get("metadata"); // JSON string or null
            boolean required = (boolean) payload.getOrDefault("required", false);
            boolean global = (boolean) payload.getOrDefault("global", false);

            return ResponseEntity.ok(
                    worldBibleService.createTemplate(id, nombre, tipo, metadata, required, global));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/folders/{idOrSlug}/templates")
    public ResponseEntity<?> getTemplates(@PathVariable String idOrSlug) {
        Long id = resolveFolderId(idOrSlug);
        if (id == null)
            return ResponseEntity.notFound().build();

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

    @DeleteMapping("/values/{id}")
    public ResponseEntity<?> deleteValue(@PathVariable Long id) {
        try {
            worldBibleService.deleteValue(id);
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/templates/{id}")
    public ResponseEntity<?> deleteTemplate(@PathVariable Long id) {
        try {
            worldBibleService.deleteTemplate(id);
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/templates/{id}")
    public ResponseEntity<?> updateTemplate(@PathVariable Long id, @RequestBody Map<String, Object> payload) {
        try {
            String nombre = (String) payload.get("nombre");
            String tipo = (String) payload.get("tipo");
            boolean global = (boolean) payload.getOrDefault("global", false);
            return ResponseEntity.ok(worldBibleService.updateTemplate(id, nombre, tipo, global));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
