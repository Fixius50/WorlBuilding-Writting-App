package com.worldbuilding.app.controller;

import com.worldbuilding.app.model.EventoTiempo;
import com.worldbuilding.app.model.LineaTiempo;
import com.worldbuilding.app.repository.EventoTiempoRepository;
import com.worldbuilding.app.repository.LineaTiempoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/timeline")
public class TimelineController {

    @Autowired
    private EventoTiempoRepository eventoRepository;

    @Autowired
    private LineaTiempoRepository lineaRepository;

    @Autowired
    private com.worldbuilding.app.repository.UniversoRepository universoRepository;

    @Autowired
    private com.worldbuilding.app.repository.CuadernoRepository cuadernoRepository;

    @GetMapping("/linea/{lineaId}/eventos")
    public List<EventoTiempo> listarEventosPorLinea(@PathVariable Long lineaId) {
        return eventoRepository.findByLineaTiempoIdOrderByOrdenAbsolutoAsc(lineaId);
    }

    @GetMapping("/eventos")
    public List<EventoTiempo> listarTodosLosEventos() {
        return eventoRepository.findAll();
    }

    @PostMapping("/evento")
    public EventoTiempo crearEvento(@RequestBody EventoTiempo evento) {
        return eventoRepository.save(evento);
    }

    @PutMapping("/evento/{id}")
    public EventoTiempo actualizarEvento(@PathVariable Long id, @RequestBody EventoTiempo eventoDetails) {
        EventoTiempo evento = eventoRepository.findById(id).orElseThrow();
        evento.setNombre(eventoDetails.getNombre());
        evento.setDescripcion(eventoDetails.getDescripcion());
        evento.setFechaTexto(eventoDetails.getFechaTexto());
        evento.setOrdenAbsoluto(eventoDetails.getOrdenAbsoluto());
        return eventoRepository.save(evento);
    }

    @DeleteMapping("/evento/{id}")
    public void eliminarEvento(@PathVariable Long id) {
        eventoRepository.deleteById(id);
    }

    @DeleteMapping("/linea/{id}")
    public void eliminarLinea(@PathVariable Long id) {
        // 1. Delete associated relations explicitly to prevent constraint issues or
        // stale data
        List<com.worldbuilding.app.model.Relacion> relaciones = relacionRepository.findAllByNode(id, "TIMELINE");
        relacionRepository.deleteAll(relaciones);

        // 2. Delete timeline (cascades to events)
        lineaRepository.deleteById(id);
    }

    // [DEBUG BYPASS]
    // @PostMapping("/linea")
    // public LineaTiempo crearLinea(@RequestBody LineaTiempo linea) { ... }

    @PostMapping("/linea")
    public org.springframework.http.ResponseEntity<?> crearLinea(@RequestBody LineaTiempo linea) {
        try {
            // Fallback: Use the first universe found in the current tenant DB.
            List<com.worldbuilding.app.model.Universo> universos = universoRepository.findAll();
            com.worldbuilding.app.model.Universo universo;

            if (!universos.isEmpty()) {
                universo = universos.get(0);
            } else {
                // Self-Healing: Create default Universe if missing
                universo = new com.worldbuilding.app.model.Universo();
                universo.setNombre("Prime Universe");

                // Ensure Cuaderno is linked (Required by FK)
                // Filter nulls to prevent stream.findFirst() NPE if repo returns null elements
                com.worldbuilding.app.model.Cuaderno cuaderno = cuadernoRepository.findAll().stream()
                        .filter(java.util.Objects::nonNull)
                        .findFirst()
                        .orElse(null);
                if (cuaderno == null) {
                    cuaderno = new com.worldbuilding.app.model.Cuaderno();
                    cuaderno.setTitulo("Prime World");
                    cuaderno.setNombreProyecto("Prime World");
                    cuaderno = cuadernoRepository.save(cuaderno);
                }
                universo.setCuaderno(cuaderno);

                universo = universoRepository.save(universo);
            }

            linea.setUniverso(universo);
            LineaTiempo saved = lineaRepository.save(linea);

            // Return detached/simplified object or just ID to prevent
            // Serialization/LazyLoad issues
            // because Open-In-View is disabled.
            java.util.Map<String, Object> result = new java.util.HashMap<>();
            result.put("id", saved.getId());
            result.put("nombre", saved.getNombre());
            result.put("descripcion", saved.getDescripcion());
            result.put("esRaiz", saved.getEsRaiz());

            return org.springframework.http.ResponseEntity.ok(result);

        } catch (Exception e) {
            e.printStackTrace();
            return org.springframework.http.ResponseEntity.status(500).body("Server Error: " + e.getMessage());
        }
    }

    @Autowired
    private com.worldbuilding.app.repository.RelacionRepository relacionRepository;

    // --- Relaciones ---

    @GetMapping("/relaciones")
    public List<com.worldbuilding.app.model.Relacion> listarRelaciones() {
        return relacionRepository.findAll();
    }

    @PostMapping("/relacion")
    public com.worldbuilding.app.model.Relacion crearRelacion(
            @RequestBody com.worldbuilding.app.model.Relacion relacion) {
        return relacionRepository.save(relacion);
    }

    @DeleteMapping("/relacion/{id}")
    public void eliminarRelacion(@PathVariable Long id) {
        relacionRepository.deleteById(id);
    }
}
