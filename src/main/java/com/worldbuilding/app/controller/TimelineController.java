package com.worldbuilding.app.controller;

import com.worldbuilding.app.model.EventoTiempo;
import com.worldbuilding.app.model.LineaTiempo;
import com.worldbuilding.app.repository.EventoTiempoRepository;
import com.worldbuilding.app.repository.LineaTiempoRepository;
import com.worldbuilding.app.exception.UnauthorizedException;
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

    private com.worldbuilding.app.model.Cuaderno getProyectoActual(jakarta.servlet.http.HttpSession session) {
        String nombreProyecto = (String) session.getAttribute("proyectoActivo");
        if (nombreProyecto == null)
            throw new UnauthorizedException("No hay proyecto activo en sesión.");

        String currentContext = com.worldbuilding.app.config.TenantContext.getCurrentTenant();
        if (!nombreProyecto.equals(currentContext)) {
            com.worldbuilding.app.config.TenantContext.setCurrentTenant(nombreProyecto);
        }

        return cuadernoRepository.findByNombreProyecto(nombreProyecto).stream()
                .filter(java.util.Objects::nonNull)
                .findFirst()
                .orElseThrow(() -> new UnauthorizedException("Proyecto no encontrado."));
    }

    @GetMapping("/list")
    public List<java.util.Map<String, Object>> listarLineas(jakarta.servlet.http.HttpSession session) {
        getProyectoActual(session); // Sync TenantContext
        return lineaRepository.findAll().stream()
                .filter(java.util.Objects::nonNull)
                .map(lt -> {
                    java.util.Map<String, Object> dto = new java.util.HashMap<>();
                    dto.put("id", lt.getId());
                    dto.put("nombre", lt.getNombre());
                    dto.put("descripcion", lt.getDescripcion());
                    dto.put("esRaiz", lt.getEsRaiz());
                    return dto;
                }).toList();
    }

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
    public org.springframework.http.ResponseEntity<?> crearLinea(@RequestBody LineaTiempo linea,
            jakarta.servlet.http.HttpSession session) {
        getProyectoActual(session);

        if (linea.getUniverso() == null) {
            // Logic: Default to the first available Universe (usually "Universo Principal")
            List<com.worldbuilding.app.model.Universo> universos = universoRepository.findAll();

            if (universos.isEmpty()) {
                // Strict Rule: If NO universe exists at all, then we fail. We do not "create"
                // one on the fly.
                throw new RuntimeException(
                        "No Universe found for this project. Please create a Universe in the Bible first.");
            }

            // Assign the found universe
            linea.setUniverso(universos.get(0));
        }

        LineaTiempo saved = lineaRepository.save(linea);

        java.util.Map<String, Object> result = new java.util.HashMap<>();
        result.put("id", saved.getId());
        result.put("nombre", saved.getNombre());
        result.put("descripcion", saved.getDescripcion());
        result.put("esRaiz", saved.getEsRaiz());

        return org.springframework.http.ResponseEntity.ok(result);
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
