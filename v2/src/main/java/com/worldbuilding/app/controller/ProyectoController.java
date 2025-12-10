package com.worldbuilding.app.controller;

import com.worldbuilding.app.config.DynamicDataSourceConfig;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;
import java.util.Map;

/**
 * Controlador de proyectos con gestión de BD H2 dinámica.
 * Cada proyecto tiene su propia BD en un archivo .mv.db separado.
 */
@RestController
@RequestMapping("/api/proyectos")
public class ProyectoController {

    private static final String PROYECTO_ACTIVO = "proyectoActivo";

    @Autowired
    private DynamicDataSourceConfig dataSourceConfig;

    /**
     * Crea un nuevo proyecto con su propia BD H2
     */
    @PostMapping("/crear")
    public ResponseEntity<?> crearProyecto(@RequestBody Map<String, String> body, HttpSession session) {
        String nombre = body.get("nombreProyecto");
        String tipo = body.get("tipo");

        if (nombre == null || nombre.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "El nombre del proyecto es requerido"));
        }

        // Sanitizar nombre (solo alfanuméricos y guiones)
        String nombreSanitizado = nombre.replaceAll("[^a-zA-Z0-9_-]", "_");

        if (dataSourceConfig.existsProject(nombreSanitizado)) {
            return ResponseEntity.badRequest().body(Map.of("error", "Ya existe un proyecto con ese nombre"));
        }

        try {
            // Cambiar al DataSource del nuevo proyecto (se crea automáticamente)
            dataSourceConfig.switchToProject(nombreSanitizado);

            // Guardar en sesión
            session.setAttribute(PROYECTO_ACTIVO, nombreSanitizado);

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "mensaje", "Proyecto creado exitosamente",
                    "nombreProyecto", nombreSanitizado,
                    "tipo", tipo != null ? tipo : "general"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Error creando proyecto: " + e.getMessage()));
        }
    }

    /**
     * Abre un proyecto existente
     */
    @GetMapping("/{nombre}")
    public ResponseEntity<?> abrirProyecto(@PathVariable String nombre, HttpSession session) {
        String nombreSanitizado = nombre.replaceAll("[^a-zA-Z0-9_-]", "_");

        if (!dataSourceConfig.existsProject(nombreSanitizado)) {
            return ResponseEntity.status(404).body(Map.of("error", "Proyecto no encontrado"));
        }

        // Cambiar al DataSource del proyecto
        dataSourceConfig.switchToProject(nombreSanitizado);
        session.setAttribute(PROYECTO_ACTIVO, nombreSanitizado);

        return ResponseEntity.ok(Map.of(
                "success", true,
                "nombreProyecto", nombreSanitizado));
    }

    /**
     * Obtiene el proyecto activo de la sesión
     */
    @GetMapping("/activo")
    public ResponseEntity<?> obtenerProyectoActivo(HttpSession session) {
        String nombreProyecto = (String) session.getAttribute(PROYECTO_ACTIVO);

        if (nombreProyecto == null || nombreProyecto.equals("default")) {
            return ResponseEntity.status(404).body(Map.of("error", "No hay proyecto activo"));
        }

        // Asegurar que estamos conectados a la BD correcta
        dataSourceConfig.switchToProject(nombreProyecto);

        return ResponseEntity.ok(Map.of(
                "nombreProyecto", nombreProyecto,
                "activo", true));
    }

    /**
     * Lista todos los proyectos disponibles (archivos .mv.db)
     */
    @GetMapping
    public ResponseEntity<?> listarProyectos() {
        try {
            List<String> proyectos = dataSourceConfig.listProjects();
            return ResponseEntity.ok(proyectos.stream()
                    .map(p -> Map.of("nombreProyecto", p))
                    .toList());
        } catch (IOException e) {
            return ResponseEntity.status(500).body(Map.of("error", "Error listando proyectos"));
        }
    }

    /**
     * Cierra la sesión del proyecto activo
     */
    @PostMapping("/cerrar")
    public ResponseEntity<?> cerrarProyecto(HttpSession session) {
        session.removeAttribute(PROYECTO_ACTIVO);
        dataSourceConfig.switchToProject("default");
        return ResponseEntity.ok(Map.of("success", true, "mensaje", "Proyecto cerrado"));
    }

    /**
     * Elimina un proyecto (borra su archivo .mv.db)
     */
    @DeleteMapping("/{nombre}")
    public ResponseEntity<?> eliminarProyecto(@PathVariable String nombre, HttpSession session) {
        String nombreSanitizado = nombre.replaceAll("[^a-zA-Z0-9_-]", "_");

        if (!dataSourceConfig.existsProject(nombreSanitizado)) {
            return ResponseEntity.status(404).body(Map.of("error", "Proyecto no encontrado"));
        }

        try {
            // Si es el proyecto activo, cerrarlo primero
            String activo = (String) session.getAttribute(PROYECTO_ACTIVO);
            if (nombreSanitizado.equals(activo)) {
                session.removeAttribute(PROYECTO_ACTIVO);
            }

            dataSourceConfig.deleteProject(nombreSanitizado);
            return ResponseEntity.ok(Map.of("success", true, "mensaje", "Proyecto eliminado"));
        } catch (IOException e) {
            return ResponseEntity.status(500).body(Map.of("error", "Error eliminando proyecto: " + e.getMessage()));
        }
    }
}
