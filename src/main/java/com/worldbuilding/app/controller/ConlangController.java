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

    @Autowired
    private com.worldbuilding.app.repository.GramaticaRuleRepository gramaticaRuleRepository;

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

    @GetMapping("/{id}")
    public Conlang obtenerLengua(@PathVariable Long id) {
        return conlangRepository.findById(id).orElseThrow();
    }

    @GetMapping("/{id}/diccionario")
    public List<Palabra> listarDiccionario(@PathVariable Long id) {
        return palabraRepository.findByConlangId(id);
    }

    @PostMapping("/{id}/palabra")
    public Palabra agregarPalabra(@PathVariable Long id, @RequestBody Palabra palabra) {
        Conlang c = conlangRepository.findById(id).orElseThrow();
        palabra.setConlang(c);
        return palabraRepository.save(palabra);
    }

    @PatchMapping("/{id}/palabra/{palabraId}/glyph")
    public Palabra actualizarGlifo(@PathVariable Long id, @PathVariable Long palabraId,
            @RequestBody Map<String, String> data) {
        Palabra p = palabraRepository.findById(palabraId).orElseThrow();
        if (data.containsKey("svgPathData")) {
            p.setSvgPathData(data.get("svgPathData"));
        }
        return palabraRepository.save(p);
    }

    // --- Grammar Rules ---
    @GetMapping("/{id}/rules")
    public List<com.worldbuilding.app.model.GramaticaRule> listarReglas(@PathVariable Long id) {
        return gramaticaRuleRepository.findByConlangId(id);
    }

    @PostMapping("/{id}/rule")
    public com.worldbuilding.app.model.GramaticaRule agregarRegla(@PathVariable Long id,
            @RequestBody com.worldbuilding.app.model.GramaticaRule rule) {
        rule.setConlangId(id);
        if (rule.getStatus() == null)
            rule.setStatus("Draft");
        return gramaticaRuleRepository.save(rule);
    }

    @DeleteMapping("/rule/{ruleId}")
    public ResponseEntity<?> eliminarRegla(@PathVariable Long ruleId) {
        gramaticaRuleRepository.deleteById(ruleId);
        return ResponseEntity.ok(Map.of("success", true));
    }

    @PostMapping("/{id}/upload-font")
    public ResponseEntity<?> subirFuente(@PathVariable Long id, @RequestParam("file") MultipartFile file) {
        try {
            Conlang c = conlangRepository.findById(id).orElseThrow();
            c.setFontBinary(file.getBytes());
            conlangRepository.save(c);
            return ResponseEntity.ok(Map.of("success", true, "message", "Fuente binaria actualizada"));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("success", false, "error", e.getMessage()));
        }
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
            wordCount += palabraRepository.findByConlangId(c.getId()).size();
            ruleCount += gramaticaRuleRepository.findByConlangId(c.getId()).size();

            List<Palabra> words = palabraRepository.findByConlangId(c.getId());
            for (Palabra p : words) {
                if (p.getSvgPathData() != null && !p.getSvgPathData().isEmpty()) {
                    glyphCount++;
                }
            }
        }

        return ResponseEntity.ok(Map.of(
                "words", wordCount,
                "rules", ruleCount,
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

        boolean exists = entidadColectivaRepository.findByNombreProyecto(proyecto).stream()
                .anyMatch(e -> e.getNombre().equalsIgnoreCase(name));

        if (!exists) {
            com.worldbuilding.app.model.EntidadColectiva ent = new com.worldbuilding.app.model.EntidadColectiva();
            ent.setNombre(name);
            ent.setDescripcion(description);
            ent.setTipo("Lenguaje");
            ent.setNombreProyecto(proyecto);
            ent.setComportamiento("Evolutivo");
            ent.setCantidadMiembros(1);
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
