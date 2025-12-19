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
            return ResponseEntity.badRequest().body("ID requerido");
        Cuaderno c = cuadernoRepository.findById(id).orElse(null);
        if (c == null)
            return ResponseEntity.status(404).body("Cuaderno no encontrado");

        return ResponseEntity.ok(hojaRepository.findByCuadernoOrderByNumeroPaginaAsc(c));
    }

    @PostMapping("/cuaderno/{id}/hoja")
    public ResponseEntity<?> añadirHoja(@PathVariable Long id) {
        if (id == null)
            return ResponseEntity.badRequest().body("ID requerido");
        Cuaderno c = cuadernoRepository.findById(id).orElse(null);
        if (c == null)
            return ResponseEntity.status(404).body("Cuaderno no encontrado");

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
            return ResponseEntity.badRequest().body("ID requerido");
        return ResponseEntity.ok(hojaRepository.findById(id).orElse(null));
    }

    @PutMapping("/hoja/{id}")
    public ResponseEntity<?> guardarHoja(@PathVariable Long id, @RequestBody Map<String, String> body) {
        if (id == null)
            return ResponseEntity.badRequest().body("ID requerido");
        Hoja h = hojaRepository.findById(id).orElse(null);
        if (h == null)
            return ResponseEntity.status(404).body("Hoja no encontrada");

        h.setContenido(body.get("contenido"));
        h.setFechaModificacion(LocalDateTime.now());

        return ResponseEntity.ok(hojaRepository.save(h));
    }
}
