package com.worldbuilding.app.controller;

import com.worldbuilding.app.model.Cuaderno;
import com.worldbuilding.app.model.Hoja;
import com.worldbuilding.app.repository.CuadernoRepository;
import com.worldbuilding.app.repository.HojaRepository;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/escritura")
public class EscrituraController {

    @Autowired
    private CuadernoRepository cuadernoRepository;

    @Autowired
    private HojaRepository hojaRepository;

    @Autowired
    private com.worldbuilding.app.repository.NotaRapidaRepository notaRapidaRepository;

    private String getProyectoActivo(HttpSession session) {
        return (String) session.getAttribute("proyectoActivo");
    }

    @GetMapping("/cuadernos")
    public ResponseEntity<?> listarCuadernos(HttpSession session) {
        String proyecto = getProyectoActivo(session);
        if (proyecto == null)
            return ResponseEntity.status(401).body("No hay proyecto activo");

        List<Cuaderno> cuadernos = cuadernoRepository.findByNombreProyecto(proyecto);
        return ResponseEntity.ok(cuadernos.stream()
                .map(c -> Map.of(
                        "id", c.getId(),
                        "titulo", c.getTitulo() != null ? c.getTitulo() : "Sin título",
                        "descripcion", c.getDescripcion() != null ? c.getDescripcion() : "",
                        "nombreProyecto", c.getNombreProyecto()))
                .toList());
    }

    @PostMapping("/cuaderno")
    public ResponseEntity<?> crearCuaderno(@RequestBody Map<String, String> body, HttpSession session) {
        String proyecto = getProyectoActivo(session);
        if (proyecto == null)
            return ResponseEntity.status(401).body("No hay proyecto activo");

        Cuaderno c = new Cuaderno();
        c.setNombreProyecto(proyecto);
        c.setTitulo(body.getOrDefault("titulo", "Nuevo Cuaderno"));
        c.setDescripcion(body.get("descripcion"));

        Cuaderno guardado = cuadernoRepository.save(c);

        // Crear primera hoja automáticamente
        Hoja primera = new Hoja();
        primera.setCuaderno(guardado);
        primera.setNumeroPagina(1);
        primera.setContenido("");
        hojaRepository.save(primera);

        return ResponseEntity.ok(Map.of(
                "id", guardado.getId(),
                "titulo", guardado.getTitulo(),
                "nombreProyecto", guardado.getNombreProyecto()));
    }

    @GetMapping("/cuaderno/{id}/hojas")
    public ResponseEntity<?> listarHojas(@PathVariable Long id) {
        if (id == null)
            return ResponseEntity.badRequest().body(Map.of("error", "ID requerido"));
        Cuaderno c = cuadernoRepository.findById(id).orElse(null);
        if (c == null)
            return ResponseEntity.status(404).body(Map.of("error", "Cuaderno no encontrado"));

        List<Hoja> hojas = hojaRepository.findByCuadernoOrderByNumeroPaginaAsc(c);

        // Transform to include note count
        List<Map<String, Object>> response = hojas.stream().map(h -> {
            Map<String, Object> map = new java.util.HashMap<>();
            map.put("id", h.getId());
            map.put("numeroPagina", h.getNumeroPagina());
            map.put("contenido", h.getContenido());
            map.put("fechaModificacion", h.getFechaModificacion());
            map.put("notasCount", notaRapidaRepository.countByHoja(h));
            return map;
        }).collect(java.util.stream.Collectors.toList());

        return ResponseEntity.ok(response);
    }

    @PostMapping("/cuaderno/{id}/hoja")
    public ResponseEntity<?> añadirHoja(@PathVariable Long id) {
        if (id == null)
            return ResponseEntity.badRequest().body(Map.of("error", "ID requerido"));
        Cuaderno c = cuadernoRepository.findById(id).orElse(null);
        if (c == null)
            return ResponseEntity.status(404).body(Map.of("error", "Cuaderno no encontrado"));

        List<Hoja> hojas = hojaRepository.findByCuadernoOrderByNumeroPaginaAsc(c);
        int nxt = hojas.size() + 1;

        Hoja h = new Hoja();
        h.setCuaderno(c);
        h.setNumeroPagina(nxt);
        h.setContenido("");

        return ResponseEntity.ok(hojaRepository.save(h));
    }

    @GetMapping("/hoja/{id}")
    public ResponseEntity<?> obtenerHoja(@PathVariable Long id) {
        if (id == null)
            return ResponseEntity.badRequest().body(Map.of("error", "ID requerido"));
        return ResponseEntity.ok(hojaRepository.findById(id).orElse(null));
    }

    @PutMapping("/hoja/{id}")
    public ResponseEntity<?> guardarHoja(@PathVariable Long id, @RequestBody Map<String, String> body) {
        if (id == null)
            return ResponseEntity.badRequest().body(Map.of("error", "ID requerido"));
        Hoja h = hojaRepository.findById(id).orElse(null);
        if (h == null)
            return ResponseEntity.status(404).body(Map.of("error", "Hoja no encontrada"));

        h.setContenido(body.get("contenido"));
        h.setFechaModificacion(LocalDateTime.now());

        return ResponseEntity.ok(hojaRepository.save(h));
    }

    @DeleteMapping("/hoja/{id}")
    public ResponseEntity<?> eliminarHoja(@PathVariable Long id) {
        if (id == null)
            return ResponseEntity.badRequest().body(Map.of("error", "ID requerido"));

        Hoja h = hojaRepository.findById(id).orElse(null);
        if (h == null)
            return ResponseEntity.status(404).body(Map.of("error", "Hoja no encontrada"));

        try {
            hojaRepository.delete(h);
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Error eliminando hoja"));
        }
    }
}
