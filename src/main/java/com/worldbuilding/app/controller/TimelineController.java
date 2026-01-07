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

    @PostMapping("/linea")
    public LineaTiempo crearLinea(@RequestBody LineaTiempo linea) {
        // Fallback: Use the first universe found in the current tenant DB.
        // In this architecture, each project has its own DB, so usually there's 1
        // Universe per DB.
        List<com.worldbuilding.app.model.Universo> universos = universoRepository.findAll();
        com.worldbuilding.app.model.Universo universo;

        if (!universos.isEmpty()) {
            universo = universos.get(0);
            linea.setUniverso(universo);
        }
        return lineaRepository.save(linea);
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
