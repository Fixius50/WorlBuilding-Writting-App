package com.worldbuilding.WorldbuildingApp.controladores;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.nio.file.*;
import java.util.Map;

@RestController
@RequestMapping("/api/proyectos")
public class ProyectoController {

    private final String DATA_FOLDER = "src/main/resources/static/data";

    @PostMapping
    public ResponseEntity<?> crearProyecto(@RequestBody Map<String, String> datos) {
        String nombreProyecto = datos.get("nombreProyecto");
        String enfoqueProyecto = datos.get("enfoqueProyecto");

        if (nombreProyecto == null || enfoqueProyecto == null) {
            return ResponseEntity.badRequest().body("Faltan datos del proyecto");
        }

        try {
            Path proyectoDir = Paths.get(DATA_FOLDER, nombreProyecto);

            if (Files.exists(proyectoDir)) {
                return ResponseEntity.badRequest().body("El proyecto ya existe");
            }

            Files.createDirectories(proyectoDir);

            // Crear archivo SQL vacío
            Path archivoSQL = proyectoDir.resolve(nombreProyecto + ".sql");
            Files.createFile(archivoSQL);

            return ResponseEntity.ok("Proyecto creado correctamente");
        } catch (IOException e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error creando proyecto");
        }
    }

    @GetMapping("/{nombre}")
    public ResponseEntity<?> abrirProyecto(@PathVariable String nombre) {
        Path proyectoDir = Paths.get(DATA_FOLDER, nombre);
        if (Files.exists(proyectoDir) && Files.isDirectory(proyectoDir)) {
            return ResponseEntity.ok("Proyecto encontrado: " + nombre);
        } else {
            return ResponseEntity.status(404).body("Proyecto no encontrado");
        }
    }
}