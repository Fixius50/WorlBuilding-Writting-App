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
import org.springframework.transaction.annotation.Transactional;

@RestController
@RequestMapping("/api/escritura")
public class EscrituraController {

    @Autowired
    private CuadernoRepository cuadernoRepository;

    @Autowired
    private HojaRepository hojaRepository;

    @Autowired
    private com.worldbuilding.app.repository.NotaRapidaRepository notaRapidaRepository;

    @GetMapping("/cuadernos")
    public List<Cuaderno> listarCuadernos(HttpSession session) {
        String nombreProyecto = (String) session.getAttribute("proyectoActivo");
        if (nombreProyecto == null)
            return List.of();

        return cuadernoRepository.findByNombreProyecto(nombreProyecto);
    }

    @PostMapping("/cuaderno")
    public ResponseEntity<?> crearCuaderno(@RequestBody Map<String, String> body, HttpSession session) {
        String nombreProyecto = (String) session.getAttribute("proyectoActivo");
        if (nombreProyecto == null)
            return ResponseEntity.status(401).body("No hay proyecto activo");

        Cuaderno nuevo = new Cuaderno();
        nuevo.setNombreProyecto(nombreProyecto);
        nuevo.setTitulo(body.getOrDefault("titulo", "Nuevo Archivador"));
        nuevo.setDescripcion(body.get("descripcion"));

        Cuaderno guardado = cuadernoRepository.save(nuevo);
        return ResponseEntity.ok(guardado);
    }

    @GetMapping("/cuaderno/{id}")
    public ResponseEntity<?> obtenerCuaderno(@PathVariable Long id) {
        if (id == null)
            return ResponseEntity.badRequest().body(Map.of("error", "ID requerido"));
        Cuaderno c = cuadernoRepository.findById(id).orElse(null);
        if (c == null)
            return ResponseEntity.status(404).body(Map.of("error", "Cuaderno no encontrado"));

        return ResponseEntity.ok(Map.of(
                "id", c.getId(),
                "titulo", c.getTitulo() != null ? c.getTitulo() : "Sin título",
                "descripcion", c.getDescripcion() != null ? c.getDescripcion() : "",
                "nombreProyecto", c.getNombreProyecto()));
    }

    @GetMapping("/cuaderno/{id}/hojas")
    public ResponseEntity<?> listarHojas(@PathVariable Long id) {
        try {
            if (id == null)
                return ResponseEntity.badRequest().body(Map.of("error", "ID requerido"));
            Cuaderno c = cuadernoRepository.findById(id).orElse(null);
            if (c == null)
                return ResponseEntity.status(404).body(Map.of("error", "Cuaderno no encontrado"));

            List<Hoja> hojas = hojaRepository.findByCuadernoOrderByNumeroPaginaAsc(c);

            List<Map<String, Object>> response = hojas.stream().map(h -> {
                Map<String, Object> map = new java.util.HashMap<>();
                map.put("id", h.getId());
                map.put("numeroPagina", h.getNumeroPagina());
                map.put("contenido", h.getContenido());
                map.put("fechaModificacion", h.getFechaModificacion());
                try {
                    map.put("notasCount", notaRapidaRepository.countByHoja(h));
                } catch (Exception e) {
                    map.put("notasCount", 0);
                }
                return map;
            }).collect(java.util.stream.Collectors.toList());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            try {
                java.nio.file.Files.writeString(
                        java.nio.file.Path
                                .of("c:/Users/rober/Desktop/Proyectos propios/WorldbuildingApp/Docs/debug_error.log"),
                        e.toString() + "\n" + java.util.Arrays.toString(e.getStackTrace()));
            } catch (Exception ex) {
                ex.printStackTrace();
            }
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Error interno: " + e.getMessage()));
        }
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
        h.setContenido("<p></p>");

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
    @Transactional
    public ResponseEntity<?> eliminarHoja(@PathVariable Long id) {
        if (id == null)
            return ResponseEntity.badRequest().body(Map.of("error", "ID requerido"));

        Hoja h = hojaRepository.findById(id).orElse(null);
        if (h == null)
            return ResponseEntity.status(404).body(Map.of("error", "Hoja no encontrada"));

        try {
            notaRapidaRepository.deleteByHoja(h);
            hojaRepository.delete(h);
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Error eliminando hoja: " + e.getMessage()));
        }
    }

    @PutMapping("/cuaderno/{id}")
    public ResponseEntity<?> actualizarCuaderno(@PathVariable Long id, @RequestBody Map<String, String> body) {
        if (id == null)
            return ResponseEntity.badRequest().body(Map.of("error", "ID requerido"));

        Cuaderno c = cuadernoRepository.findById(id).orElse(null);
        if (c == null)
            throw new com.worldbuilding.app.exception.ResourceNotFoundException("Cuaderno no encontrado");

        if (body.containsKey("titulo")) {
            c.setTitulo(body.get("titulo"));
        }
        if (body.containsKey("descripcion")) {
            c.setDescripcion(body.get("descripcion"));
        }

        return ResponseEntity.ok(cuadernoRepository.save(c));
    }

    @DeleteMapping("/cuaderno/{id}")
    @Transactional
    public ResponseEntity<?> eliminarCuaderno(@PathVariable Long id) {
        if (id == null)
            return ResponseEntity.badRequest().body(Map.of("error", "ID requerido"));

        Cuaderno c = cuadernoRepository.findById(id).orElse(null);
        if (c == null)
            throw new com.worldbuilding.app.exception.ResourceNotFoundException("Cuaderno no encontrado");

        try {
            cuadernoRepository.delete(c);
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Error eliminando cuaderno: " + e.getMessage()));
        }
    }
}
