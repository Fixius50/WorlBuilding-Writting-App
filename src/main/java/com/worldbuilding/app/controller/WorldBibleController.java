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
    private static final org.slf4j.Logger logger = org.slf4j.LoggerFactory.getLogger(WorldBibleController.class);

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

        if (nombreProyecto == null) {
            logger.warn(">>> [Controller] No project in session.");
            return null;
        }

        logger.debug(">>> [Controller] Getting project for session attribute: {}", nombreProyecto);

        String currentContext = com.worldbuilding.app.config.TenantContext.getCurrentTenant();
        if (!nombreProyecto.equals(currentContext)) {
            com.worldbuilding.app.config.TenantContext.setCurrentTenant(nombreProyecto);
        }

        Optional<Cuaderno> found = cuadernoRepository.findByNombreProyecto(nombreProyecto).stream()
                .filter(java.util.Objects::nonNull)
                .sorted(java.util.Comparator.comparing(Cuaderno::getId))
                .findFirst();

        return found.orElse(null);
    }

    @GetMapping("/folders")
    public ResponseEntity<?> getRootFolders(HttpSession session) {
        Cuaderno proyecto = getProyectoActual(session);

        if (proyecto == null)
            return ResponseEntity.status(401).body(Map.of("error", "No active project"));
        return ResponseEntity.ok(worldBibleService.getRootFolders(proyecto));
    }

    @GetMapping("/graph")
    public ResponseEntity<?> getGraphData(HttpSession session) {
        Cuaderno proyecto = getProyectoActual(session);
        if (proyecto == null)
            return ResponseEntity.status(401).body(Map.of("error", "No active project"));

        try {
            return ResponseEntity.ok(worldBibleService.getGraphData(proyecto));
        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body(Map.of("error", e.getMessage() != null ? e.getMessage() : "Unknown error"));
        }
    }

    @GetMapping("/folders/{idOrSlug}")
    public ResponseEntity<?> getFolder(@PathVariable String idOrSlug) {
        Long id = resolveFolderId(idOrSlug);
        if (id == null)
            return ResponseEntity.notFound().build();

        java.util.Map<String, Object> detail = worldBibleService.getFolderDetail(id);
        if (detail == null)
            return ResponseEntity.notFound().build();

        return ResponseEntity.ok(detail);
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
        try {
            Long id = resolveFolderId(idOrSlug);
            if (id == null)
                return ResponseEntity.notFound().build();

            Optional<Carpeta> carpeta = carpetaRepository.findById(id);
            if (carpeta.isEmpty())
                return ResponseEntity.notFound().build();
            return ResponseEntity.ok(worldBibleService.getEntitiesInFolder(carpeta.get()));
        } catch (Exception e) {
            System.err.println("[ERROR] getEntitiesInFolder failed: " + e.getMessage());
            return ResponseEntity.status(500)
                    .body(Map.of("error", e.getMessage() != null ? e.getMessage() : "Unknown error"));
        }
    }

    @PostMapping("/folders")
    public ResponseEntity<?> createFolder(@RequestBody Map<String, Object> payload, HttpSession session) {
        Cuaderno proyecto = getProyectoActual(session);
        if (proyecto == null) {
            logger.error(">>> [createFolder] Failed: No active project in session.");
            return ResponseEntity.status(401).body(Map.of("error", "No active project"));
        }
        logger.info(">>> [createFolder] Creating folder '{}' in project '{}'", payload.get("nombre"),
                proyecto.getTitulo());

        try {
            String nombre = (String) payload.get("nombre");
            String descripcion = (String) payload.get("descripcion");
            Number padreId = (Number) payload.get("padreId");
            String tipo = (String) payload.get("tipo");

            Carpeta created = worldBibleService.createFolder(nombre, descripcion, proyecto,
                    padreId != null ? padreId.longValue() : null, tipo);

            return ResponseEntity.ok(Map.of(
                    "id", created.getId(),
                    "nombre", created.getNombre() != null ? created.getNombre() : "",
                    "slug", created.getSlug() != null ? created.getSlug() : "",
                    "tipo", created.getTipo() != null ? created.getTipo() : "",
                    "itemCount", created.getItemCount()));
        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body(Map.of("error", e.getMessage() != null ? e.getMessage() : "Unknown error"));
        }
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
        String categoria = (String) payload.get("categoria");
        @SuppressWarnings("unchecked")
        Map<String, Object> attributes = (Map<String, Object>) payload.get("attributes");

        try {
            EntidadGenerica created = worldBibleService.createEntity(nombre, proyecto, carpetaId.longValue(),
                    tipoEspecial,
                    descripcion, iconUrl, categoria, attributes);
            return ResponseEntity.ok(Map.of(
                    "id", created.getId(),
                    "nombre", created.getNombre(),
                    "slug", created.getSlug(),
                    "categoria", created.getCategoria() != null ? created.getCategoria() : "",
                    "iconUrl", created.getIconUrl() != null ? created.getIconUrl() : ""));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/entities")
    public ResponseEntity<?> getAllEntities(HttpSession session) {
        Cuaderno proyecto = getProyectoActual(session);
        if (proyecto == null)
            return ResponseEntity.status(401).body(Map.of("error", "No active project"));

        try {
            return ResponseEntity.ok(entidadGenericaRepository.findByProyecto(proyecto).stream()
                    .filter(java.util.Objects::nonNull)
                    .map(e -> {
                        Map<String, Object> entityMap = new java.util.HashMap<>();
                        entityMap.put("id", e.getId());
                        entityMap.put("nombre", e.getNombre());
                        entityMap.put("slug", e.getSlug());
                        entityMap.put("categoria", e.getCategoria() != null ? e.getCategoria() : "");
                        entityMap.put("tipoEspecial", e.getTipoEspecial() != null ? e.getTipoEspecial() : "");
                        entityMap.put("iconUrl", e.getIconUrl() != null ? e.getIconUrl() : "");
                        entityMap.put("attributes",
                                e.getAttributes() != null ? e.getAttributes() : new java.util.HashMap<>());
                        return entityMap;
                    })
                    .toList());
        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body(Map.of("error", e.getMessage() != null ? e.getMessage() : "Unknown error"));
        }
    }

    @GetMapping("/entities/search")
    public ResponseEntity<?> searchEntities(@RequestParam String q, HttpSession session) {
        Cuaderno proyecto = getProyectoActual(session);
        if (proyecto == null)
            return ResponseEntity.status(401).body(Map.of("error", "No active project"));

        List<EntidadGenerica> all = entidadGenericaRepository.findByProyecto(proyecto);
        String query = q.toLowerCase();

        List<Map<String, Object>> results = all.stream()
                .filter(e -> e.getNombre().toLowerCase().contains(query))
                .limit(10)
                .map(e -> Map.<String, Object>of(
                        "id", e.getId(),
                        "value", e.getNombre(),
                        "nombre", e.getNombre(),
                        "categoria", e.getCategoria() != null ? e.getCategoria() : "entity",
                        "iconUrl", e.getIconUrl() != null ? e.getIconUrl() : "",
                        "slug", e.getSlug() != null ? e.getSlug() : ""))
                .toList();

        return ResponseEntity.ok(results);
    }

    @GetMapping("/favorites")
    public ResponseEntity<?> getFavorites(HttpSession session) {
        Cuaderno proyecto = getProyectoActual(session);
        if (proyecto == null)
            return ResponseEntity.status(401).body(Map.of("error", "No active project"));

        return ResponseEntity.ok(worldBibleService.getFavorites(proyecto));
    }

    @GetMapping("/entities/{idOrSlug}")
    public ResponseEntity<?> getEntity(@PathVariable String idOrSlug, HttpSession session) {
        Cuaderno proyecto = getProyectoActual(session);
        if (proyecto == null)
            return ResponseEntity.status(401).body(Map.of("error", "No active project"));

        EntidadGenerica entity = worldBibleService.getEntity(idOrSlug);
        if (entity == null)
            return ResponseEntity.notFound().build();
        return ResponseEntity.ok(entity);
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

    @PutMapping("/entities/{id}")
    public ResponseEntity<?> updateEntity(@PathVariable Long id, @RequestBody Map<String, Object> payload,
            HttpSession session) {
        Cuaderno proyecto = getProyectoActual(session);
        if (proyecto == null)
            return ResponseEntity.status(401).body(Map.of("error", "No active project"));

        Optional<EntidadGenerica> ent = entidadGenericaRepository.findById(id);
        if (ent.isEmpty())
            return ResponseEntity.notFound().build();

        if (!ent.get().getProyecto().getId().equals(proyecto.getId())) {
            return ResponseEntity.status(403).body(Map.of("error", "Access denied"));
        }

        try {
            String nombre = (String) payload.get("nombre");
            Number carpetaId = (Number) payload.get("carpetaId");
            String tipoEspecial = (String) payload.get("tipoEspecial");
            String descripcion = (String) payload.get("descripcion");
            String iconUrl = (String) payload.get("iconUrl");
            String categoria = (String) payload.get("categoria");
            String apariencia = (String) payload.get("apariencia");
            @SuppressWarnings("unchecked")
            Map<String, Object> attributes = (Map<String, Object>) payload.get("attributes");

            return ResponseEntity.ok(worldBibleService.updateEntity(id, nombre,
                    carpetaId != null ? carpetaId.longValue() : null,
                    tipoEspecial, descripcion, iconUrl, categoria, apariencia, attributes));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PatchMapping("/entities/{entityId}/values")
    public ResponseEntity<?> updateEntityValues(@PathVariable Long entityId,
            @RequestBody List<WorldBibleService.ValueUpdateDTO> updates) {
        try {
            worldBibleService.updateEntityValues(entityId, updates);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body(Map.of("error", e.getMessage() != null ? e.getMessage() : "Unknown error"));
        }
    }

    @PatchMapping("/entities/{entityId}/details")
    public ResponseEntity<?> updateEntityDetails(@PathVariable Long entityId,
            @RequestBody Map<String, Object> payload) {
        try {
            String descripcion = (String) payload.get("descripcion");
            String tags = (String) payload.get("tags");
            String apariencia = (String) payload.get("apariencia");
            @SuppressWarnings("unchecked")
            Map<String, Object> attributes = (Map<String, Object>) payload.get("attributes");
            return ResponseEntity
                    .ok(worldBibleService.updateEntityDetails(entityId, descripcion, tags, apariencia, attributes));
        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body(Map.of("error", e.getMessage() != null ? e.getMessage() : "Unknown error"));
        }
    }

    @PatchMapping("/entities/{id}/favorite")
    public ResponseEntity<?> toggleFavorite(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(worldBibleService.toggleFavorite(id));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
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

    @GetMapping("/templates/global")
    public ResponseEntity<?> getGlobalTemplates(HttpSession session) {
        Cuaderno proyecto = getProyectoActual(session);
        if (proyecto == null)
            return ResponseEntity.status(401).body(Map.of("error", "No active project"));
        return ResponseEntity.ok(worldBibleService.getGlobalTemplates(proyecto));
    }

    @GetMapping("/folders/{idOrSlug}/templates")
    public ResponseEntity<?> getTemplates(@PathVariable String idOrSlug) {
        Long id = resolveFolderId(idOrSlug);
        if (id == null)
            return ResponseEntity.notFound().build();

        return ResponseEntity.ok(worldBibleService.getAllInheritedTemplates(id));
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
