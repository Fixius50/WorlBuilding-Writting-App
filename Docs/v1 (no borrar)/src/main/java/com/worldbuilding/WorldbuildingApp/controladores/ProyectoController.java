package com.worldbuilding.WorldbuildingApp.controladores;

import jakarta.servlet.http.HttpSession;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardOpenOption;
import java.util.*;

import com.worldbuilding.WorldbuildingApp.modelos.Proyecto;
import com.worldbuilding.WorldbuildingApp.servicios.ProyectoService;
import com.worldbuilding.interfaces.ProyectoRepository;

/**
 * Esta clase controla el proyecto que se va a usar o crear en la aplicación.
 * Ahora guarda el proyecto en la Base de Datos Y crea un archivo .sql de log.
 */
@RestController
@RequestMapping("/api/proyectos")
public class ProyectoController {

    @Autowired
    private ProyectoService proyectoService;

    @Autowired
    private ProyectoRepository proyectoRepository;

    private final String DATA_FOLDER = "src/main/data";

    @PostMapping("/crear")
    public ResponseEntity<Map<String, String>> crearProyecto(@RequestParam String nombre, @RequestParam String enfoque, HttpSession session) {
        
        // 1. Guardar en la Base de Datos
        try {
            Proyecto nuevoProyecto = new Proyecto(nombre, enfoque);
            proyectoRepository.save(nuevoProyecto);
        
        } catch (DataIntegrityViolationException e) {
            // Error si el nombre del proyecto (Primary Key) ya existe
            return ResponseEntity
                    .status(HttpStatus.CONFLICT) // 409 Conflict
                    .body(Map.of("error", "El proyecto con el nombre '" + nombre + "' ya existe."));
        
        } catch (Exception e) {
            // Cualquier otro error de base de datos
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error interno al guardar en la BD: " + e.getMessage()));
        }

        // 2. Crear el archivo .sql de log (como lo hacías antes)
        try {
            Path archivoSQL = Paths.get(DATA_FOLDER, nombre + ".sql");
            
            if (Files.exists(archivoSQL)) {
                 // Esto no debería pasar si la BD falló primero, pero es un buen control
                 return ResponseEntity
                    .status(HttpStatus.CONFLICT)
                    .body(Map.of("error", "El archivo .sql de log '" + nombre + ".sql' ya existe."));
            }

            StringBuilder contenidoProyecto = new StringBuilder();
            contenidoProyecto.append("-- ===========================================\n");
            contenidoProyecto.append("-- PROYECTO: ").append(nombre).append("\n");
            contenidoProyecto.append("-- ENFOQUE: ").append(enfoque).append("\n");
            contenidoProyecto.append("-- FECHA DE CREACIÓN: ").append(java.time.LocalDateTime.now()).append("\n");
            contenidoProyecto.append("-- ===========================================\n\n");
            contenidoProyecto.append("-- Este archivo es un LOG/HISTORIAL de las operaciones del proyecto.\n");
            contenidoProyecto.append("-- La base de datos 'viva' es MySQL.\n\n");
            contenidoProyecto.append("use worldbuilding;\n\n");
            
            Files.writeString(archivoSQL, contenidoProyecto.toString(), StandardOpenOption.WRITE, StandardOpenOption.CREATE);

        } catch (IOException e) {
            // Error si no se puede escribir el archivo .sql
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error al crear el archivo .sql de log: " + e.getMessage()));
        }

        // 3. Guardar en la sesión y devolver ÉXITO
        session.setAttribute("proyectoActivo", nombre);
        session.setAttribute("enfoqueProyectoActivo", enfoque);
        
        return ResponseEntity
                .ok(Map.of("message", "Proyecto '" + nombre + "' creado y guardado en la base de datos."));
    }


    /**
     * Abre un proyecto existente.
     * 1. Busca el proyecto en la base de datos.
     * 2. Si existe, lo guarda en la sesión.
     * Devuelve siempre una respuesta JSON.
     */
    @GetMapping("/{nombre}")
    public ResponseEntity<Map<String, String>> abrirProyecto(@PathVariable String nombre, HttpSession session) {
        
        // 1. Buscar en la Base de Datos
        return proyectoRepository.findById(nombre)
            .map(proyecto -> {
                // 2. Si se encuentra, guardar en sesión y devolver ÉXITO
                session.setAttribute("proyectoActivo", proyecto.getNombreProyecto());
                session.setAttribute("enfoqueProyectoActivo", proyecto.getEnfoqueProyecto());
                
                return ResponseEntity
                        .ok(Map.of("message", "Proyecto '" + nombre + "' abierto correctamente."));
            })
            .orElse(
                // 3. Si no se encuentra, devolver ERROR
                ResponseEntity
                        .status(HttpStatus.NOT_FOUND) // 404 Not Found
                        .body(Map.of("error", "El proyecto '" + nombre + "' no existe en la base de datos."))
            );
    }

    /**
     * Obtiene el proyecto activo de la sesión.
     * Devuelve siempre una respuesta JSON.
     */
    @GetMapping("/activo")
    public ResponseEntity<Map<String, String>> getProyectoActivo(HttpSession session) {
        String nombre = (String) session.getAttribute("proyectoActivo");
        String enfoque = (String) session.getAttribute("enfoqueProyectoActivo");

        if (nombre != null && enfoque != null) {
            // Éxito
            return ResponseEntity
                    .ok(Map.of("nombre", nombre, "enfoque", enfoque));
        } else {
            // Error
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "No hay ningún proyecto activo en la sesión."));
        }
    }

    @PostMapping("/agregar-operacion")
    public ResponseEntity<?> agregarOperacionSQL(@RequestParam String operacionSQL, HttpSession session) {
        String nombreProyecto = (String) session.getAttribute("proyectoActivo");
        if (nombreProyecto == null) {
            return ResponseEntity.status(404).body("No hay proyecto activo");
        }

        try {
            proyectoService.agregarOperacionAlArchivo(nombreProyecto, operacionSQL);
            return ResponseEntity.ok("Operación SQL agregada correctamente al proyecto '" + nombreProyecto + "'");
        } catch (IOException e) {
            return ResponseEntity.status(500).body("Error agregando operación SQL: " + e.getMessage());
        }
    }
}