package com.worldbuilding.WorldbuildingApp.controladores;

import jakarta.servlet.http.HttpSession; // Librería que permite mantener el proyecto que se está usando
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
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

    // Usar una carpeta de datos en el directorio home del usuario. Es más robusto y seguro.
    private final Path DATA_FOLDER = Paths.get(System.getProperty("user.home"), "WorldbuildingAppProjects");

    @PostMapping
    public ResponseEntity<?> crearProyecto(
        @RequestParam String nombre,
        @RequestParam String enfoque,
        HttpSession session
    ) {
        try {
            Path proyectoDir = DATA_FOLDER.resolve(nombre);

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
            session.setAttribute("enfoqueProyectoActivo", enfoque);

            return ResponseEntity.ok("Proyecto creado correctamente");
        } catch (IOException e) {
            return ResponseEntity.status(500).body("Error creando el proyecto");
        }
    }

    @GetMapping("/{nombre}")
    public ResponseEntity<?> abrirProyecto(@PathVariable String nombre, HttpSession session) {
        Path proyectoDir = DATA_FOLDER.resolve(nombre);
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

    @GetMapping("/activo")
    public ResponseEntity<?> getProyectoActivo(HttpSession session) {
        String nombre = (String) session.getAttribute("proyectoActivo");
        String enfoque = (String) session.getAttribute("enfoqueProyectoActivo");

        if (nombre != null && enfoque != null) {
            return ResponseEntity.ok(new ProyectoActivo(nombre, enfoque));
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