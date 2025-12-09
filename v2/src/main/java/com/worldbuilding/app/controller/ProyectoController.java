package com.worldbuilding.app.controller;

import com.worldbuilding.app.model.Proyecto;
import com.worldbuilding.app.service.ProyectoService;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/proyectos")
public class ProyectoController {

    private static final String PROYECTO_ACTIVO = "proyectoActivo";

    @Autowired
    private ProyectoService proyectoService;

    /**
     * Crea un nuevo proyecto y lo guarda en sesión
     */
    @PostMapping("/crear")
    public ResponseEntity<?> crearProyecto(@RequestBody Map<String, String> body, HttpSession session) {
        String nombre = body.get("nombreProyecto");
        String tipo = body.get("tipo");

        if (nombre == null || nombre.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "El nombre del proyecto es requerido"));
        }

        if (proyectoService.existe(nombre)) {
            return ResponseEntity.badRequest().body(Map.of("error", "Ya existe un proyecto con ese nombre"));
        }

        Proyecto proyecto = proyectoService.crear(nombre, tipo);
        session.setAttribute(PROYECTO_ACTIVO, proyecto.getNombreProyecto());

        return ResponseEntity.ok(Map.of(
                "success", true,
                "mensaje", "Proyecto creado exitosamente",
                "proyecto", proyecto));
    }

    /**
     * Abre un proyecto existente y lo guarda en sesión
     */
    @GetMapping("/{nombre}")
    public ResponseEntity<?> abrirProyecto(@PathVariable String nombre, HttpSession session) {
        Optional<Proyecto> proyectoOpt = proyectoService.buscarPorNombre(nombre);

        if (proyectoOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("error", "Proyecto no encontrado"));
        }

        Proyecto proyecto = proyectoOpt.get();
        session.setAttribute(PROYECTO_ACTIVO, proyecto.getNombreProyecto());

        return ResponseEntity.ok(Map.of(
                "success", true,
                "proyecto", proyecto));
    }

    /**
     * Obtiene el proyecto activo de la sesión
     */
    @GetMapping("/activo")
    public ResponseEntity<?> obtenerProyectoActivo(HttpSession session) {
        String nombreProyecto = (String) session.getAttribute(PROYECTO_ACTIVO);

        if (nombreProyecto == null) {
            return ResponseEntity.status(404).body(Map.of("error", "No hay proyecto activo"));
        }

        Optional<Proyecto> proyectoOpt = proyectoService.buscarPorNombre(nombreProyecto);
        if (proyectoOpt.isEmpty()) {
            session.removeAttribute(PROYECTO_ACTIVO);
            return ResponseEntity.status(404).body(Map.of("error", "Proyecto no encontrado"));
        }

        return ResponseEntity.ok(proyectoOpt.get());
    }

    /**
     * Lista todos los proyectos
     */
    @GetMapping
    public ResponseEntity<List<Proyecto>> listarProyectos() {
        return ResponseEntity.ok(proyectoService.listarTodos());
    }

    /**
     * Cierra la sesión del proyecto activo
     */
    @PostMapping("/cerrar")
    public ResponseEntity<?> cerrarProyecto(HttpSession session) {
        session.removeAttribute(PROYECTO_ACTIVO);
        return ResponseEntity.ok(Map.of("success", true, "mensaje", "Proyecto cerrado"));
    }
}
