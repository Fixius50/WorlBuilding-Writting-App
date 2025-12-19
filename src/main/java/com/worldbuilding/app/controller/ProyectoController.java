package com.worldbuilding.app.controller;

import com.worldbuilding.app.model.Cuaderno;
import com.worldbuilding.app.repository.CuadernoRepository;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Controlador de proyectos (Cuadernos) usando JPA.
 * Gestiona la entidad Cuaderno en la base de datos única (SQLite).
 */
@RestController
@RequestMapping("/api/proyectos")
public class ProyectoController {

    private static final String PROYECTO_ACTIVO = "proyectoActivo";

    @Autowired
    private CuadernoRepository cuadernoRepository;

    /**
     * Crea un nuevo proyecto (Cuaderno)
     */
    @PostMapping("/crear")
    public ResponseEntity<?> crearProyecto(@RequestBody Map<String, String> body, HttpSession session) {
        String nombre = body.get("nombreProyecto");
        String tipo = body.get("tipo");
        String descripcion = body.get("descripcion");

        if (nombre == null || nombre.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "El nombre del proyecto es requerido"));
        }

        // Verificar si ya existe (asumiendo unicidad por nombre para simplificar
        // migración)
        // Idealmente usariamos findByNombreProyecto pero findAll().stream()... sirve
        // para prototipo si no existe el método exacto
        boolean existe = cuadernoRepository.findAll().stream()
                .anyMatch(c -> c.getNombreProyecto().equalsIgnoreCase(nombre));

        if (existe) {
            return ResponseEntity.badRequest().body(Map.of("error", "Ya existe un proyecto con ese nombre"));
        }

        try {
            Cuaderno nuevo = new Cuaderno();
            nuevo.setNombreProyecto(nombre);
            nuevo.setTitulo(nombre); // Default title
            nuevo.setDescripcion(descripcion != null ? descripcion : "Nuevo proyecto");

            cuadernoRepository.save(nuevo);

            // Guardar en sesión
            session.setAttribute(PROYECTO_ACTIVO, nombre);

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "mensaje", "Proyecto creado exitosamente",
                    "nombreProyecto", nombre,
                    "id", nuevo.getId(),
                    "tipo", tipo != null ? tipo : "general"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Error creando proyecto: " + e.getMessage()));
        }
    }

    /**
     * Abre un proyecto existente (lo establece en sesión)
     */
    @GetMapping("/{nombre}")
    public ResponseEntity<?> abrirProyecto(@PathVariable String nombre, HttpSession session) {
        Optional<Cuaderno> cuaderno = cuadernoRepository.findAll().stream()
                .filter(c -> c.getNombreProyecto().equalsIgnoreCase(nombre))
                .findFirst();

        if (cuaderno.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("error", "Proyecto no encontrado"));
        }

        // Establecer activo en sesión
        session.setAttribute(PROYECTO_ACTIVO, cuaderno.get().getNombreProyecto());

        return ResponseEntity.ok(Map.of(
                "success", true,
                "nombreProyecto", cuaderno.get().getNombreProyecto(),
                "id", cuaderno.get().getId()));
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

        return ResponseEntity.ok(Map.of(
                "nombreProyecto", nombreProyecto,
                "activo", true));
    }

    /**
     * Lista todos los proyectos disponibles
     */
    @GetMapping
    public ResponseEntity<?> listarProyectos() {
        try {
            List<Cuaderno> proyectos = cuadernoRepository.findAll();
            return ResponseEntity.ok(proyectos.stream()
                    .map(c -> Map.of(
                            "nombreProyecto", c.getNombreProyecto(),
                            "id", c.getId(),
                            "descripcion", c.getDescripcion() != null ? c.getDescripcion() : ""))
                    .toList());
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Error listando proyectos"));
        }
    }

    /**
     * Cierra la sesión del proyecto activo
     */
    @PostMapping("/cerrar")
    public ResponseEntity<?> cerrarProyecto(HttpSession session) {
        session.removeAttribute(PROYECTO_ACTIVO);
        return ResponseEntity.ok(Map.of("success", true, "mensaje", "Proyecto cerrado"));
    }

    /**
     * Elimina un proyecto
     */
    @DeleteMapping("/{nombre}")
    public ResponseEntity<?> eliminarProyecto(@PathVariable String nombre, HttpSession session) {
        Optional<Cuaderno> cuaderno = cuadernoRepository.findAll().stream()
                .filter(c -> c.getNombreProyecto().equalsIgnoreCase(nombre))
                .findFirst();

        if (cuaderno.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("error", "Proyecto no encontrado"));
        }

        try {
            // Si es el proyecto activo, cerrarlo primero
            String activo = (String) session.getAttribute(PROYECTO_ACTIVO);
            if (nombre.equalsIgnoreCase(activo)) {
                session.removeAttribute(PROYECTO_ACTIVO);
            }

            cuadernoRepository.delete(cuaderno.get());

            return ResponseEntity.ok(Map.of("success", true, "mensaje", "Proyecto eliminado"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Error eliminando proyecto: " + e.getMessage()));
        }
    }
}
