package com.worldbuilding.WorldbuildingApp.controladores;

import jakarta.servlet.http.HttpSession; // Librería que permite mantener el proyecto que se está usando
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.worldbuilding.WorldbuildingApp.modelos.ProyectoDTO;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardOpenOption;

/**
 * Esta clase controla el proyecto que se va a usar o crear en la aplicación según una serie de funciones internas definidas. 
 * @see crearProyecto
 * @see abrirProyecto
 */
@RestController
@RequestMapping("/api/proyectos")
public class ProyectoController {

    // ADVERTENCIA: Esta ruta funcionará en el IDE, pero fallará al empaquetar en un JAR.
    private final String DATA_FOLDER = "src/main/data";
    private final String WORLD_BUILDING_SQL = "worldbuilding.sql";
    public String nombre, enfoque;

    @PostMapping
    public ResponseEntity<?> crearProyecto(
        @RequestParam String nombre,
        @RequestParam String enfoque,
        HttpSession session
    ) {
        ResponseEntity<String> entity;
        try {
            Path archivoSQL = Paths.get(DATA_FOLDER, nombre + ".sql");
            Path worldBuildingSQL = Paths.get(DATA_FOLDER, WORLD_BUILDING_SQL);

            if (Files.exists(archivoSQL)) {
                entity = ResponseEntity.badRequest().body("El proyecto ya existe");
                return entity;
            }

            // Verificar que existe worldbuilding.sql
            if (!Files.exists(worldBuildingSQL)) {
                entity = ResponseEntity.status(500).body("Error: No se encuentra el archivo worldbuilding.sql");
                return entity;
            }

            // Escapamos las comillas simples para prevenir inyección de SQL básica
            String nombreSeguro = nombre.replace("'", "''");
            String enfoqueSeguro = enfoque.replace("'", "''");
            
            // Crear el contenido del archivo del proyecto
            StringBuilder contenidoProyecto = new StringBuilder();
            contenidoProyecto.append("-- ===========================================\n");
            contenidoProyecto.append("-- PROYECTO: ").append(nombre).append("\n");
            contenidoProyecto.append("-- ENFOQUE: ").append(enfoque).append("\n");
            contenidoProyecto.append("-- FECHA DE CREACIÓN: ").append(java.time.LocalDateTime.now()).append("\n");
            contenidoProyecto.append("-- ===========================================\n\n");
            
            // Agregar referencia a worldbuilding.sql
            contenidoProyecto.append("-- REFERENCIA A LA BASE DE DATOS GENERAL\n");
            contenidoProyecto.append("-- Este archivo usa worldbuilding.sql como base\n");
            contenidoProyecto.append("-- Las tablas y funciones están definidas en worldbuilding.sql\n\n");
            
            // Solo agregar "use worldbuilding;"
            contenidoProyecto.append("use worldbuilding;\n\n");
            
            // Agregar sección para operaciones específicas del proyecto
            contenidoProyecto.append("-- ===========================================\n");
            contenidoProyecto.append("-- OPERACIONES ESPECÍFICAS DEL PROYECTO: ").append(nombre).append("\n");
            contenidoProyecto.append("-- ===========================================\n\n");
            
            // Insertar el proyecto en la tabla crearProyecto
            contenidoProyecto.append("-- Crear el proyecto en la base de datos\n");
            contenidoProyecto.append("INSERT INTO crearProyecto (nombreProyecto, enfoqueProyecto) VALUES ('")
                              .append(nombreSeguro).append("', '").append(enfoqueSeguro).append("');\n\n");
            
            // Agregar comentarios para futuras operaciones
            contenidoProyecto.append("-- ===========================================\n");
            contenidoProyecto.append("-- AQUÍ SE AGREGARÁN LAS OPERACIONES ESPECÍFICAS DEL PROYECTO\n");
            contenidoProyecto.append("-- ===========================================\n\n");
            contenidoProyecto.append("-- Ejemplos de operaciones que se pueden agregar:\n");
            contenidoProyecto.append("-- INSERT INTO entidadIndividual (nombre, apellidos, estado, tipo, origen, comportamiento, descripcion) VALUES (...);\n");
            contenidoProyecto.append("-- INSERT INTO construccion (nombre, apellidos, tamanno, tipo, desarrollo, descripcion) VALUES (...);\n");
            contenidoProyecto.append("-- INSERT INTO zona (nombre, apellidos, tamanno, tipo, desarrollo, descripcion) VALUES (...);\n");
            contenidoProyecto.append("-- INSERT INTO efectos (nombre, apellidos, origen, dureza, comportamiento, descripcion) VALUES (...);\n");
            contenidoProyecto.append("-- INSERT INTO interaccion (nombre, apellidos, direccion, tipo, afectados, descripcion) VALUES (...);\n\n");
            
            // Escribir el archivo del proyecto
            Files.writeString(archivoSQL, contenidoProyecto.toString(), StandardOpenOption.WRITE, StandardOpenOption.CREATE);

            // GUARDAR PROYECTO ACTIVO EN LA SESIÓN
            session.setAttribute("proyectoActivo", nombre);
            session.setAttribute("enfoqueProyectoActivo", enfoque);

            entity = ResponseEntity.ok("Proyecto '" + nombre + "' creado correctamente con archivo SQL específico");
            
        } catch (IOException e) {
            entity = ResponseEntity.status(500).body("Error creando el proyecto: " + e.getMessage());
        }
        return entity;
    }

    @GetMapping("/{nombre}")
    public ResponseEntity<?> abrirProyecto(@PathVariable String nombre, HttpSession session) {
        Path archivoSQL = Paths.get(DATA_FOLDER, nombre + ".sql");
        ResponseEntity<String> entity;
        if (Files.exists(archivoSQL) && !Files.isDirectory(archivoSQL)) {
            session.setAttribute("proyectoActivo", nombre);

            try {
                String contenido = Files.readString(archivoSQL);
                String enfoque = extraerEnfoqueDesdeSQL(contenido);
                session.setAttribute("enfoqueProyectoActivo", enfoque);
                entity = ResponseEntity.ok("Proyecto '" + nombre + "' abierto correctamente");
            } catch (IOException e) {
                entity = ResponseEntity.status(500).body("Error leyendo el archivo del proyecto: " + e.getMessage());
            }
        } else {
            entity = ResponseEntity.status(404).body("Proyecto '" + nombre + "' no encontrado");
        }
        return entity;
    }

    private String extraerEnfoqueDesdeSQL(String contenido) {
        for (String linea : contenido.split("\n")) {
            if (linea.startsWith("-- ENFOQUE:")) {
                return linea.replace("-- ENFOQUE:", "").trim();
            }
        }
        return null;
    }

    @GetMapping("/activo")
    public ResponseEntity<?> getProyectoActivo(HttpSession session) {
        String nombre = (String) session.getAttribute("proyectoActivo");
        String enfoque = (String) session.getAttribute("enfoqueProyectoActivo");
        ResponseEntity<String> entity;
        if (nombre != null && enfoque != null) {
            ProyectoDTO proyecto = new ProyectoDTO(nombre, enfoque);
            entity = ResponseEntity.ok("Proyecto activo: " + nombre + " - Enfoque: " + enfoque);
            proyecto.setNombre(nombre);
            proyecto.setEnfoque(enfoque);
        } else{
            entity = ResponseEntity.status(404).body("No hay proyecto activo");
        }
        return entity;
    }

    /**
     * Método para agregar operaciones SQL al archivo del proyecto activo
     * @param operacionSQL La operación SQL a agregar
     * @param session La sesión HTTP
     * @return ResponseEntity con el resultado
     */
    @PostMapping("/agregar-operacion")
    public ResponseEntity<?> agregarOperacionSQL(
        @RequestParam String operacionSQL,
        HttpSession session
    ) {
        String nombreProyecto = (String) session.getAttribute("proyectoActivo");
        if (nombreProyecto == null) {
            return ResponseEntity.badRequest().body("No hay proyecto activo");
        }

        try {
            Path archivoSQL = Paths.get(DATA_FOLDER, nombreProyecto + ".sql");
            
            if (!Files.exists(archivoSQL)) {
                return ResponseEntity.status(404).body("Archivo del proyecto no encontrado");
            }

            // Leer el contenido actual
            String contenidoActual = Files.readString(archivoSQL);
            
            // Agregar la nueva operación al final del archivo
            String nuevaOperacion = "\n-- Operación agregada: " + java.time.LocalDateTime.now() + "\n";
            nuevaOperacion += operacionSQL + "\n";
            
            // Escribir el archivo actualizado
            Files.writeString(archivoSQL, contenidoActual + nuevaOperacion, StandardOpenOption.WRITE, StandardOpenOption.TRUNCATE_EXISTING);
            
            return ResponseEntity.ok("Operación SQL agregada correctamente al proyecto '" + nombreProyecto + "'");
            
        } catch (IOException e) {
            return ResponseEntity.status(500).body("Error agregando operación SQL: " + e.getMessage());
        }
    }

    /**
     * Método para obtener el contenido del archivo SQL del proyecto activo
     * @param session La sesión HTTP
     * @return ResponseEntity con el contenido del archivo
     */
    @GetMapping("/archivo-sql")
    public ResponseEntity<?> obtenerArchivoSQL(HttpSession session) {
        String nombreProyecto = (String) session.getAttribute("proyectoActivo");
        if (nombreProyecto == null) {
            return ResponseEntity.badRequest().body("No hay proyecto activo");
        }

        try {
            Path archivoSQL = Paths.get(DATA_FOLDER, nombreProyecto + ".sql");
            
            if (!Files.exists(archivoSQL)) {
                return ResponseEntity.status(404).body("Archivo del proyecto no encontrado");
            }

            String contenido = Files.readString(archivoSQL);
            return ResponseEntity.ok(contenido);
            
        } catch (IOException e) {
            return ResponseEntity.status(500).body("Error leyendo archivo SQL: " + e.getMessage());
        }
    }
}