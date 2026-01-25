package com.worldbuilding.app.controller;

import com.worldbuilding.app.model.Cuaderno;
import com.worldbuilding.app.model.Universo;
import com.worldbuilding.app.repository.CuadernoRepository;
import com.worldbuilding.app.repository.UniversoRepository;
import com.worldbuilding.app.exception.UnauthorizedException;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/multiverso")
public class UniversoController {

    @Autowired
    private UniversoRepository universoRepository;

    @Autowired
    private CuadernoRepository cuadernoRepository;

    private Cuaderno getProyectoActual(HttpSession session) {
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
    @org.springframework.transaction.annotation.Transactional
    public List<Universo> listarUniversos(HttpSession session) {
        Cuaderno proyecto = getProyectoActual(session);
        List<Universo> universos = universoRepository.findByCuadernoId(proyecto.getId());

        // Initialize collections for Frontend Structure
        universos.forEach(u -> {
            org.hibernate.Hibernate.initialize(u.getLineasTemporales());
            // Optional: If we want deep nesting of events, but usually we fetch events on
            // demand
        });
        return universos;
    }

    @PostMapping("/crear")
    public Universo crearUniverso(@RequestBody Universo universo, HttpSession session) {
        Cuaderno proyecto = getProyectoActual(session);
        universo.setCuaderno(proyecto);
        return universoRepository.save(universo);
    }

    @PutMapping("/{id}")
    public Universo actualizarUniverso(@PathVariable Long id, @RequestBody Universo universoDetails,
            HttpSession session) {
        getProyectoActual(session); // Verify context
        Universo universo = universoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Universo no encontrado"));

        universo.setNombre(universoDetails.getNombre());
        universo.setDescripcion(universoDetails.getDescripcion());

        return universoRepository.save(universo);
    }

    @DeleteMapping("/{id}")
    public void eliminarUniverso(@PathVariable Long id, HttpSession session) {
        getProyectoActual(session); // Verify context
        universoRepository.deleteById(id);
    }
}
