package com.worldbuilding.app.controller;

import com.worldbuilding.app.model.EventoCronologia;
import com.worldbuilding.app.repository.EventoCronologiaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/timeline")
public class TimelineController {

    @Autowired
    private EventoCronologiaRepository eventoRepository;

    @GetMapping("/linea/{lineaId}/eventos")
    public List<EventoCronologia> listarEventosPorLinea(@PathVariable Long lineaId) {
        return eventoRepository.findByLineaTemporalIdOrderByOrdenCronologicoAsc(lineaId);
    }

    @GetMapping("/eventos")
    public List<EventoCronologia> listarTodosLosEventos() {
        return eventoRepository.findAll();
    }

    @PostMapping("/evento")
    public EventoCronologia crearEvento(@RequestBody EventoCronologia evento) {
        return eventoRepository.save(evento);
    }

    @PutMapping("/evento/{id}")
    public EventoCronologia actualizarEvento(@PathVariable Long id, @RequestBody EventoCronologia eventoDetails) {
        EventoCronologia evento = eventoRepository.findById(id).orElseThrow();
        // Update fields...
        // evento.setTitulo(eventoDetails.getTitulo());
        return eventoRepository.save(evento); // Simplificación
    }

    @Autowired
    private com.worldbuilding.app.repository.EventoRelacionRepository relacionRepository;

    // --- Relaciones ---

    @GetMapping("/relaciones")
    public List<com.worldbuilding.app.model.EventoRelacion> listarRelaciones() {
        return relacionRepository.findAll();
    }

    @PostMapping("/relacion")
    public com.worldbuilding.app.model.EventoRelacion crearRelacion(
            @RequestBody com.worldbuilding.app.model.EventoRelacion relacion) {
        return relacionRepository.save(relacion);
    }

    @DeleteMapping("/relacion/{id}")
    public void eliminarRelacion(@PathVariable Long id) {
        relacionRepository.deleteById(id);
    }
}
