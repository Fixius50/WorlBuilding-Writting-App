package com.worldbuilding.WorldbuildingApp.controladores;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@RestController
@RequestMapping("/api/proyectos")
public class ProyectoController {

    private final String DATA_FOLDER = "src/main/resources/static/data";

    @PostMapping
    public ResponseEntity<?> crearProyecto(
        @RequestParam String nombre,
        @RequestParam String enfoque
    ) {
        try {
            Path proyectoDir = Paths.get(DATA_FOLDER, nombre);

            if (Files.exists(proyectoDir)) {
                return ResponseEntity.badRequest().body("El proyecto ya existe");
            }

            Files.createDirectories(proyectoDir);

            Path archivoSQL = proyectoDir.resolve(nombre + ".sql");
            Files.writeString(archivoSQL, "-- Proyecto: " + nombre + "\n-- Enfoque: " + enfoque);

            return ResponseEntity.ok("Proyecto creado correctamente");
        } catch (IOException e) {
            return ResponseEntity.status(500).body("Error creando proyecto");
        }
    }

    @GetMapping("/{nombre}")
    public ResponseEntity<?> abrirProyecto(@PathVariable String nombre) {
        Path proyectoDir = Paths.get(DATA_FOLDER, nombre);
        if (Files.exists(proyectoDir) && Files.isDirectory(proyectoDir)) {
            return ResponseEntity.ok("Proyecto existe");
        } else {
            return ResponseEntity.status(404).body("Proyecto no encontrado");
        }
    }
}