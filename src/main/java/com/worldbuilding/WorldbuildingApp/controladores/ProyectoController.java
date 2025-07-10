package com.worldbuilding.WorldbuildingApp.controladores;

import jakarta.servlet.http.HttpSession; // Librería que permite mantener el proyecto que se está usando
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardOpenOption;
import java.util.concurrent.atomic.AtomicReference;

/**
 * Esta clase controla el proyecto que se va a usar o crear en la aplicación según una serie de funciones internas definidas. 
 * @see crearProyecto
 * @see abrirProyecto
 */
@RestController
@RequestMapping("/api/proyectos")
public class ProyectoController {

    private final String DATA_FOLDER = "src/main/resources/static/data";

    @PostMapping
    public ResponseEntity<?> crearProyecto(
        @RequestParam String nombre,
        @RequestParam String enfoque,
        HttpSession session
    ) {
        try {
            Path proyectoDir = Paths.get(DATA_FOLDER, nombre);

            if (Files.exists(proyectoDir)) {
                return ResponseEntity.badRequest().body("El proyecto ya existe");
            }

            Files.createDirectories(proyectoDir);

            Path archivoSQL = proyectoDir.resolve(nombre + ".sql");
            String insertar = "-- Proyecto: " + nombre + "\n-- Enfoque: " + enfoque
                            + "\nuse worldbuilding;\ninsert into crearProyecto values('" + nombre + "', '" + enfoque + "')";
            Files.writeString(archivoSQL, insertar, StandardOpenOption.CREATE_NEW);

            // GUARDAR PROYECTO ACTIVO EN LA SESIÓN
            session.setAttribute("proyectoActivo", nombre);

            return ResponseEntity.ok("Proyecto creado correctamente");
        } catch (IOException e) {
            return ResponseEntity.status(500).body("Error creando el proyecto");
        }
    }

    @GetMapping("/{nombre}")
    public ResponseEntity<?> abrirProyecto(@PathVariable String nombre, HttpSession session) {
        Path proyectoDir = Paths.get(DATA_FOLDER, nombre);
        if (Files.exists(proyectoDir) && Files.isDirectory(proyectoDir)) {
            session.setAttribute("proyectoActivo", nombre);

            Path archivoSQL = proyectoDir.resolve(nombre + ".sql");
            if (Files.exists(archivoSQL)) {
                try {
                    String contenido = Files.readString(archivoSQL);
                    String enfoque = extraerEnfoqueDesdeSQL(contenido);
                    session.setAttribute("enfoqueProyectoActivo", enfoque);
                } catch (IOException e) {
                    return ResponseEntity.status(500).body("Error leyendo el archivo del proyecto");
                }
            }

            return ResponseEntity.ok("Proyecto abierto correctamente");
        } else {
            return ResponseEntity.status(404).body("Proyecto no encontrado");
        }
    }

    private String extraerEnfoqueDesdeSQL(String contenido) {
        for (String linea : contenido.split("\n")) {
            if (linea.startsWith("-- Enfoque:")) {
                return linea.replace("-- Enfoque:", "").trim();
            }
        }
        return null;
    }

    // Lo de abajo es para saber que proyecto se está usando
    // Esta variable lo que hace es actualizar automáticamente el proyecto
    private static final AtomicReference<ProyectoActivo> proyectoActivo = new AtomicReference<>();

    @PostMapping("/activo")
    public ResponseEntity<?> setProyectoActivo(@RequestParam String nombre, @RequestParam String enfoque) {
        proyectoActivo.set(new ProyectoActivo(nombre, enfoque));
        return ResponseEntity.ok("Proyecto activo establecido");
    }

    @GetMapping("/activo")
    public ResponseEntity<?> getProyectoActivo(HttpSession session) {
        // Primero intentamos obtenerlo desde la sesión
        String nombre = (String) session.getAttribute("proyectoActivo");
        String enfoque = (String) session.getAttribute("enfoqueProyectoActivo");

        if (nombre != null && enfoque != null) {
            return ResponseEntity.ok(new ProyectoActivo(nombre, enfoque));
        }

        // Si no está en la sesión, intentamos desde el AtomicReference
        ProyectoActivo activo = proyectoActivo.get();
        if (activo != null) {
            return ResponseEntity.ok(activo);
        }

        return ResponseEntity.status(404).body("No hay proyecto activo");
    }

    // Clase interna para representar el proyecto activo
    public static class ProyectoActivo {
        public String nombre, enfoque;

        public ProyectoActivo(String nombre, String enfoque) {
            this.nombre = nombre;
            this.enfoque = enfoque;
        }
    }
}