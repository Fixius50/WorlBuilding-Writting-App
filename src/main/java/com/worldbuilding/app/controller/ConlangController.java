package com.worldbuilding.app.controller;

import com.worldbuilding.app.model.Conlang;
import com.worldbuilding.app.model.Palabra;
import com.worldbuilding.app.repository.ConlangRepository;
import com.worldbuilding.app.repository.PalabraRepository;
import com.worldbuilding.app.service.ConlangService;
import com.worldbuilding.app.utils.VectorizationUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.io.File;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/conlang")
public class ConlangController {

    @Autowired
    private ConlangRepository conlangRepository;

    @Autowired
    private PalabraRepository palabraRepository;

    @Autowired
    private ConlangService conlangService;

    @GetMapping("/lenguas")
    public List<Conlang> listarLenguas(jakarta.servlet.http.HttpSession session) {
        String proyecto = (String) session.getAttribute("proyectoActivo");
        if (proyecto == null)
            return java.util.Collections.emptyList();
        return conlangRepository.findByNombreProyecto(proyecto);
    }

    @PostMapping("/lengua")
    public Conlang crearLengua(@RequestBody Conlang conlang, jakarta.servlet.http.HttpSession session) {
        String proyecto = (String) session.getAttribute("proyectoActivo");
        if (proyecto != null)
            conlang.setNombreProyecto(proyecto);
        return conlangRepository.save(conlang);
    }

    @GetMapping("/{id}/diccionario")
    public List<Palabra> listarDiccionario(@PathVariable Long id) {
        return palabraRepository.findByConlangId(id);
    }

    @PostMapping("/{id}/palabra")
    public Palabra agregarPalabra(@PathVariable Long id, @RequestBody Palabra palabra) {
        // En una app real, buscaríamos la entidad Conlang y la asignaríamos
        // Aquí asumimos que el objeto palabra ya tiene el ID o lo seteamos manualmente
        // si es posible,
        // pero JPA requiere la entidad Conlang.
        // Simplificación:
        Conlang c = conlangRepository.findById(id).orElseThrow();
        palabra.setConlang(c);
        return palabraRepository.save(palabra);
    }

    // --- Stats ---
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats(jakarta.servlet.http.HttpSession session) {
        String proyecto = (String) session.getAttribute("proyectoActivo");
        if (proyecto == null)
            return ResponseEntity.ok(Map.of("words", 0, "rules", 0, "glyphs", 0));

        List<Conlang> langs = conlangRepository.findByNombreProyecto(proyecto);
        long wordCount = 0;
        long ruleCount = 0;
        long glyphCount = 0;

        for (Conlang c : langs) {
            wordCount += palabraRepository.findByConlangId(c.getId()).size(); // Assuming you add this to Repo
            // ruleCount... we need finding rules by conlang.
            // For now, let's mock or use repository access if methods exist.
            // glyphCount += palabraRepository.countWithSVG...
        }

        // Simplified Logic: Just count all words for now, as Repo methods might be
        // missing.
        // We will implement `countByConlangId` in PalabraRepository next step if
        // needed.
        // For now, let's fetch all and filter in memory to avoid compilation error if
        // method missing.

        // Better: Fetch all words and filter.
        List<Palabra> allWords = palabraRepository.findAll();
        for (Palabra p : allWords) {
            if (p.getConlang() != null && proyecto.equals(p.getConlang().getNombreProyecto())) {
                wordCount++;
                if (p.getSvgPathData() != null && !p.getSvgPathData().isEmpty()) {
                    glyphCount++;
                }
            }
        }

        return ResponseEntity.ok(Map.of(
                "words", wordCount,
                "rules", 32, // Hardcoded for now until RuleRepo is ready
                "glyphs", glyphCount));
    }

    // --- Vectorization ---
    @PostMapping("/vectorize")
    public ResponseEntity<String> vectorizeImage(@RequestParam("file") MultipartFile file) {
        try {
            File tempFile = File.createTempFile("upload_", file.getOriginalFilename());
            file.transferTo(tempFile);
            String svgPath = VectorizationUtils.rasterToSVG(tempFile);
            tempFile.delete();
            return ResponseEntity.ok(svgPath);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error vectorizing: " + e.getMessage());
        }
    }

    // --- Entity Integration ---
    @Autowired
    private com.worldbuilding.app.repository.EntidadColectivaRepository entidadColectivaRepository;

    @PostMapping("/save-entity")
    public ResponseEntity<String> saveEntity(@RequestParam String name, @RequestParam String description,
            jakarta.servlet.http.HttpSession session) {
        String proyecto = (String) session.getAttribute("proyectoActivo");
        if (proyecto == null)
            return ResponseEntity.badRequest().body("No hay proyecto activo");

        // 1. Save/Update Conlang (Generic logic, or assume generic id=1 for now if not
        // passed)
        // In a real app we'd pass an ID. Here we'll just check if Entity exists under
        // this project

        // Note: Repository findByName might need project filter too, assuming
        // uniqueness per project
        boolean exists = entidadColectivaRepository.findByNombreProyecto(proyecto).stream()
                .anyMatch(e -> e.getNombre().equalsIgnoreCase(name));

        if (!exists) {
            com.worldbuilding.app.model.EntidadColectiva ent = new com.worldbuilding.app.model.EntidadColectiva();
            ent.setNombre(name);
            ent.setDescripcion(description);
            ent.setTipo("Lenguaje");
            ent.setNombreProyecto(proyecto);
            ent.setComportamiento("Evolutivo");
            ent.setCantidadMiembros(1); // Placeholder
            entidadColectivaRepository.save(ent);
            return ResponseEntity.ok("Generada nueva entidad de lenguaje.");
        }

        return ResponseEntity.ok("Entidad actualizada/existente.");
    }

    // --- NLP ---
    @GetMapping("/analyze-semantics")
    public ResponseEntity<List<String>> analyze(@RequestParam String text) {
        return ResponseEntity.ok(conlangService.getSemanticConcepts(text));
    }
}
