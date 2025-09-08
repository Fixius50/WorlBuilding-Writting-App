package com.worldbuilding.WorldbuildingApp.controladores;

import jakarta.servlet.http.HttpSession;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardOpenOption;
import java.util.*;
import com.worldbuilding.WorldbuildingApp.servicios.ProyectoService;

/**
 * Esta clase controla el proyecto que se va a usar o crear en la aplicación según una serie de funciones internas definidas. 
 * @see crearProyecto
 * @see abrirProyecto
 */
@RestController
@RequestMapping("/api/proyectos")
public class ProyectoController {

    @Autowired
    private ProyectoService proyectoService;

    // ADVERTENCIA: Esta ruta funcionará en el IDE, pero fallará al empaquetar en un JAR.
    private final String DATA_FOLDER = "src/main/data";
    private final String WORLD_BUILDING_SQL = "worldbuilding.sql";
    public String nombre, enfoque;



    @PostMapping("/crear")
    public ResponseEntity<?> crearProyecto(@RequestParam String nombre, @RequestParam String enfoque, HttpSession session) {
        try {
            Path archivoSQL = Paths.get(DATA_FOLDER, nombre + ".sql");
            Path worldBuildingSQL = Paths.get(DATA_FOLDER, WORLD_BUILDING_SQL);
            if (Files.exists(archivoSQL)) {
                return ResponseEntity.status(400).body("El proyecto ya existe");
            }
            if (!Files.exists(worldBuildingSQL)) {
                return ResponseEntity.status(500).body("No se encuentra el archivo worldbuilding.sql");
            }
            String nombreSeguro = nombre.replace("'", "''");
            String enfoqueSeguro = enfoque.replace("'", "''");
            StringBuilder contenidoProyecto = new StringBuilder();
            contenidoProyecto.append("-- ===========================================\n");
            contenidoProyecto.append("-- PROYECTO: ").append(nombre).append("\n");
            contenidoProyecto.append("-- ENFOQUE: ").append(enfoque).append("\n");
            contenidoProyecto.append("-- FECHA DE CREACIÓN: ").append(java.time.LocalDateTime.now()).append("\n");
            contenidoProyecto.append("-- ===========================================\n\n");
            contenidoProyecto.append("-- REFERENCIA A LA BASE DE DATOS GENERAL\n");
            contenidoProyecto.append("-- Este archivo usa worldbuilding.sql como base\n");
            contenidoProyecto.append("-- Las tablas y funciones están definidas en worldbuilding.sql\n\n");
            contenidoProyecto.append("use worldbuilding;\n\n");
            contenidoProyecto.append("-- ===========================================\n");
            contenidoProyecto.append("-- OPERACIONES ESPECÍFICAS DEL PROYECTO: ").append(nombre).append("\n");
            contenidoProyecto.append("-- ===========================================\n\n");
            contenidoProyecto.append("-- Crear el proyecto en la base de datos\n");
            contenidoProyecto.append("INSERT INTO crearProyecto (nombreProyecto, enfoqueProyecto) VALUES ('")
                              .append(nombreSeguro).append("', '").append(enfoqueSeguro).append("');\n\n");
            contenidoProyecto.append("-- ===========================================\n");
            contenidoProyecto.append("-- AQUÍ SE AGREGARÁN LAS OPERACIONES ESPECÍFICAS DEL PROYECTO\n");
            contenidoProyecto.append("-- ===========================================\n\n");
            Files.writeString(archivoSQL, contenidoProyecto.toString(), StandardOpenOption.WRITE, StandardOpenOption.CREATE);
            session.setAttribute("proyectoActivo", nombre);
            session.setAttribute("enfoqueProyectoActivo", enfoque);
            return ResponseEntity.ok("Proyecto '" + nombre + "' creado correctamente");
        } catch (IOException e) {
            return ResponseEntity.status(500).body(e.getMessage());
        }
    }


    @GetMapping("/{nombre}")
    public ResponseEntity<?> abrirProyecto(@PathVariable String nombre, HttpSession session) {
        Path archivoSQL = Paths.get(DATA_FOLDER, nombre + ".sql");
        Map<String, Object> response = new HashMap<>();
        
        // Log para debugging
        System.out.println("Intentando abrir proyecto: " + nombre);
        System.out.println("Sesión ID: " + session.getId());
        System.out.println("Ruta del archivo: " + archivoSQL.toAbsolutePath());

        if (Files.exists(archivoSQL) && !Files.isDirectory(archivoSQL)) {
            try {
                String contenido = Files.readString(archivoSQL);
                String enfoque = extraerEnfoqueDesdeSQL(contenido);
                
                if (enfoque == null) {
                    response.put("status", "error");
                    response.put("message", "No se pudo encontrar el enfoque del proyecto en el archivo SQL");
                    return ResponseEntity.status(500).body(response);
                }

                // Establecer atributos de sesión
                session.setAttribute("proyectoActivo", nombre);
                session.setAttribute("enfoqueProyectoActivo", enfoque);
                
                // Log para confirmar que se establecieron los atributos
                System.out.println("Proyecto activado en sesión: " + session.getAttribute("proyectoActivo"));
                System.out.println("Enfoque establecido en sesión: " + session.getAttribute("enfoqueProyectoActivo"));

                response.put("status", "success");
                response.put("message", "Proyecto '" + nombre + "' abierto correctamente");
                response.put("nombre", nombre);
                response.put("enfoque", enfoque);
                return ResponseEntity.ok(response);
                
            } catch (IOException e) {
                System.err.println("Error al leer archivo del proyecto: " + e.getMessage());
                response.put("status", "error");
                response.put("message", "Error leyendo el archivo del proyecto: " + e.getMessage());
                return ResponseEntity.status(500).body(response);
            }
        } else {
            System.out.println("Proyecto no encontrado en: " + archivoSQL.toAbsolutePath());
            response.put("status", "error");
            response.put("message", "Proyecto '" + nombre + "' no encontrado");
            return ResponseEntity.status(404).body(response);
        }
    }

    private String extraerEnfoqueDesdeSQL(String contenido) {
        String[] lineas = contenido.split("\r?\n");
        for (String linea : lineas) {
            if (linea.trim().toUpperCase().contains("ENFOQUE")) {
                return linea.replaceAll("--.*ENFOQUE\s*:\s*", "").trim();
            }
        }
        return null;
    }

    @GetMapping("/activo")
    public ResponseEntity<?> getProyectoActivo(HttpSession session) {
        String nombre = (String) session.getAttribute("proyectoActivo");
        String enfoque = (String) session.getAttribute("enfoqueProyectoActivo");

        Map<String, Object> response = new HashMap<>();
        ResponseEntity<?> entity;
        if (nombre != null && enfoque != null) {
            response.put("status", "success");
            response.put("nombre", nombre);
            response.put("enfoque", enfoque);
            entity = ResponseEntity.ok(response);
        } else {
            response.put("status", "error");
            response.put("message", "No hay proyecto activo");
            response.put("sessionId", session.getId());
            entity = ResponseEntity.status(404).body(response);
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
    public ResponseEntity<?> agregarOperacionSQL(@RequestParam String operacionSQL, HttpSession session) {
        String nombreProyecto = (String) session.getAttribute("proyectoActivo");
        if (nombreProyecto == null) {
            return ResponseEntity.status(404).body("No hay proyecto activo");
        }

        try {
            proyectoService.agregarOperacionAArchivo(nombreProyecto, operacionSQL);
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
            throw new RuntimeException("No hay proyecto activo");
        }

        try {
            Path archivoSQL = Paths.get(DATA_FOLDER, nombreProyecto + ".sql");
            if (!Files.exists(archivoSQL)) {
                throw new RuntimeException("Archivo del proyecto no encontrado");
            }

            String contenido = Files.readString(archivoSQL);
            return ResponseEntity.ok(contenido);
            
        } catch (IOException e) {
            return ResponseEntity.status(500).body("Error leyendo archivo SQL: " + e.getMessage());
        }
    }

    /**
     * Método para obtener todos los datos del proyecto activo ejecutando SELECT * en cada tabla
     * @param session La sesión HTTP
     * @return ResponseEntity con los datos estructurados de todas las tablas
     */
    @GetMapping("/datos-proyecto")
    public ResponseEntity<Map<String, Object>> obtenerDatosProyecto(HttpSession session) {
        String nombreProyecto = (String) session.getAttribute("proyectoActivo");
        try {
            if (nombreProyecto == null) {
                return ResponseEntity.status(404).body(Map.of("error", "No hay proyecto activo"));
            }
            
            Path archivoSQL = Paths.get(DATA_FOLDER, nombreProyecto + ".sql");
            if (!Files.exists(archivoSQL)) {
                return ResponseEntity.status(404).body(Map.of("error", "Archivo del proyecto no encontrado"));
            }

            String contenido = Files.readString(archivoSQL);
            
            // Crear objeto con los datos estructurados
            Map<String, Object> datosProyecto = new HashMap<>();
            datosProyecto.put("nombreProyecto", nombreProyecto);
            datosProyecto.put("enfoque", session.getAttribute("enfoqueProyectoActivo"));
            
            // Extraer datos de cada tabla del contenido SQL
            Map<String, List<Map<String, Object>>> tablas = new HashMap<>();
            
            // Tablas que queremos extraer
            String[] nombresTablas = {
                "entidadIndividual", "entidadColectiva", "construccion", 
                "zona", "efectos", "interaccion"
            };
            
            for (String tabla : nombresTablas) {
                List<Map<String, Object>> datosTabla = proyectoService.extraerDatosDeTabla(contenido, tabla);
                // Solo agregar la tabla si tiene datos
                if (!datosTabla.isEmpty()) {
                    tablas.put(tabla, datosTabla);
                }
            }
            
            datosProyecto.put("tablas", tablas);
            datosProyecto.put("status", "success");
            
            return ResponseEntity.ok(datosProyecto);
            
        } catch (IOException e) {
            return ResponseEntity.status(500).body(Map.of(
                "error", "Error al obtener datos del proyecto: " + e.getMessage(),
                "status", "error"
            ));
        }
    }
}