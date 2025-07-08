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
            return ResponseEntity.status(500).body("Error creando proyecto");
        }
    }

    @GetMapping("/{nombre}")
    public ResponseEntity<?> abrirProyecto(@PathVariable String nombre, HttpSession session) {
        Path proyectoDir = Paths.get(DATA_FOLDER, nombre);
        if (Files.exists(proyectoDir) && Files.isDirectory(proyectoDir)) {
            session.setAttribute("proyectoActivo", nombre); // <-- GUARDAR PROYECTO ACTIVO
            return ResponseEntity.ok("Proyecto abierto correctamente");
        } else {
            return ResponseEntity.status(404).body("Proyecto no encontrado");
        }
    }

    // Lo de abajo es para saber que proyecto se está usando
    private static final AtomicReference<ProyectoActivo> proyectoActivo = new AtomicReference<>();

    @PostMapping("/activo")
    public ResponseEntity<?> setProyectoActivo(@RequestParam String nombre, @RequestParam String enfoque) {
        proyectoActivo.set(new ProyectoActivo(nombre, enfoque));
        return ResponseEntity.ok("Proyecto activo establecido");
    }

    @GetMapping("/activo")
    public ResponseEntity<?> getProyectoActivo() {
        ProyectoActivo activo = proyectoActivo.get();
        if (activo == null) {
            return ResponseEntity.status(404).body("No hay proyecto activo");
        }
        return ResponseEntity.ok(activo);
    }

    // Clase interna para representar el proyecto activo
    public static class ProyectoActivo {
        public String nombre;
        public String enfoque;

        public ProyectoActivo(String nombre, String enfoque) {
            this.nombre = nombre;
            this.enfoque = enfoque;
        }
    }
}