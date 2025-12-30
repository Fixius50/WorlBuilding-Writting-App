package com.worldbuilding.app.controller;

import com.worldbuilding.app.model.Cuaderno;
import com.worldbuilding.app.model.Usuario;
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
        Usuario usuarioActual = (Usuario) session.getAttribute("user");
        String nombre = body.get("nombreProyecto");
        String tipo = body.get("tipo");
        String genero = body.get("genero");
        String imagenUrl = body.get("imagenUrl");
        String descripcion = body.get("descripcion");

        if (nombre == null || nombre.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "El nombre del proyecto es requerido"));
        }

        // Verificar si ya existe PARA ESTE USUARIO
        boolean existe = cuadernoRepository.findByUsuarioId(usuarioActual.getId()).stream()
                .anyMatch(c -> c.getNombreProyecto().equalsIgnoreCase(nombre));

        if (existe) {
            return ResponseEntity.badRequest().body(Map.of("error", "Ya tienes un proyecto con ese nombre"));
        }

        try {
            Cuaderno nuevo = new Cuaderno();
            nuevo.setNombreProyecto(nombre);
            nuevo.setTitulo(nombre);
            nuevo.setDescripcion(descripcion != null ? descripcion : "Nuevo proyecto");
            nuevo.setTipo(tipo != null ? tipo : "General");
            nuevo.setGenero(genero != null ? genero : "Fantasía");
            nuevo.setImagenUrl(imagenUrl != null ? imagenUrl : "");
            nuevo.setUsuarioId(usuarioActual.getId());

            cuadernoRepository.save(nuevo);

            session.setAttribute(PROYECTO_ACTIVO, nombre);

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "mensaje", "Proyecto creado exitosamente",
                    "nombreProyecto", nombre,
                    "id", nuevo.getId()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Error creando proyecto: " + e.getMessage()));
        }
    }

    /**
     * Abre un proyecto existente (lo establece en sesión)
     */
    @GetMapping("/{identifier}")
    public ResponseEntity<?> abrirProyecto(@PathVariable String identifier, HttpSession session) {
        Usuario usuarioActual = (Usuario) session.getAttribute("user");
        Optional<Cuaderno> cuaderno = Optional.empty();

        // Try to parse as ID first
        try {
            Long id = Long.parseLong(identifier);
            cuaderno = cuadernoRepository.findById(id)
                    .filter(c -> c.getUsuarioId().equals(usuarioActual.getId()));
        } catch (NumberFormatException e) {
            // Not an ID, try as name
            cuaderno = cuadernoRepository.findByUsuarioId(usuarioActual.getId()).stream()
                    .filter(c -> c.getNombreProyecto().equalsIgnoreCase(identifier))
                    .findFirst();
        }

        if (cuaderno.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("error", "Proyecto no encontrado o no te pertenece"));
        }

        // CRITICAL: Set the session variable used by other controllers
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
     * Lista todos los proyectos disponibles PARA EL USUARIO
     */
    @GetMapping
    public ResponseEntity<?> listarProyectos(HttpSession session) {
        Usuario usuarioActual = (Usuario) session.getAttribute("user");
        try {
            List<Cuaderno> proyectos = cuadernoRepository.findByUsuarioId(usuarioActual.getId());
            return ResponseEntity.ok(proyectos.stream()
                    .map(c -> Map.of(
                            "nombreProyecto", c.getNombreProyecto(),
                            "id", c.getId(),
                            "tipo", c.getTipo() != null ? c.getTipo() : "",
                            "genero", c.getGenero() != null ? c.getGenero() : "",
                            "imagenUrl", c.getImagenUrl() != null ? c.getImagenUrl() : "",
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
        Usuario usuarioActual = (Usuario) session.getAttribute("user");
        Optional<Cuaderno> cuaderno = cuadernoRepository.findByUsuarioId(usuarioActual.getId()).stream()
                .filter(c -> c.getNombreProyecto().equalsIgnoreCase(nombre))
                .findFirst();

        if (cuaderno.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("error", "Proyecto no encontrado o no te pertenece"));
        }

        try {
            String activo = (String) session.getAttribute(PROYECTO_ACTIVO);
            if (nombre.equalsIgnoreCase(activo)) {
                session.removeAttribute(PROYECTO_ACTIVO);
            }

            cuaderno.ifPresent(cuadernoRepository::delete);

            return ResponseEntity.ok(Map.of("success", true, "mensaje", "Proyecto eliminado"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Error eliminando proyecto: " + e.getMessage()));
        }
    }
}
