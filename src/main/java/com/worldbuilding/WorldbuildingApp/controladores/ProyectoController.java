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

    // ADVERTENCIA: Esta ruta funcionará en el IDE, pero fallará al empaquetar en un JAR.
    private final String DATA_FOLDER = "src/main/resources/static/data";
    public String nombre, enfoque;

    // Elimina el constructor con parámetros para evitar problemas de inyección de dependencias
    // Usa un DTO para las respuestas
    public static class ProyectoDTO {
        public String nombre;
        public String enfoque;
        public ProyectoDTO(String nombre, String enfoque) {
            this.nombre = nombre;
            this.enfoque = enfoque;
        }
    }

    @PostMapping
    public ResponseEntity<?> crearProyecto(
        @RequestParam String nombre,
        @RequestParam String enfoque,
        HttpSession session
    ) {
        ResponseEntity<String> entity;
        try {
            Path archivoSQL = Paths.get(DATA_FOLDER, nombre + ".sql");

            if (Files.exists(archivoSQL)) {
                entity = ResponseEntity.badRequest().body("El proyecto ya existe");
                throw new IOException();
            } else{
                // Escapamos las comillas simples para prevenir inyección de SQL básica
                String nombreSeguro = nombre.replace("'", "''");
                String enfoqueSeguro = enfoque.replace("'", "''");
                String insertar = "-- Proyecto: " + nombre + "\n-- Enfoque: " + enfoque + "\n"
                                + "use worldbuilding;\ninsert into crearProyecto values('" + nombreSeguro + "', '" + enfoqueSeguro + "');";
                Files.writeString(archivoSQL, insertar, StandardOpenOption.CREATE_NEW);

                // GUARDAR PROYECTO ACTIVO EN LA SESIÓN
                session.setAttribute("proyectoActivo", nombre);
                session.setAttribute("enfoqueProyectoActivo", enfoque);

                entity = ResponseEntity.ok("Proyecto creado correctamente");
            }
        } catch (IOException e) {
            entity = ResponseEntity.status(500).body("Error creando el proyecto");
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
                entity = ResponseEntity.ok("Proyecto abierto correctamente");
            } catch (IOException e) {
                entity = ResponseEntity.status(500).body("Error leyendo el archivo del proyecto");
            }
        } else {
            entity = ResponseEntity.status(404).body("Proyecto no encontrado");
        }
        return entity;
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
        ResponseEntity<String> entity;
        if (nombre != null && enfoque != null) {
            new ProyectoDTO(nombre, enfoque);
            entity = ResponseEntity.ok("Proyecto activo: " + nombre + " - Enfoque: " + enfoque);
        } else{
            entity = ResponseEntity.status(404).body(null);
        }
        return entity;
    }
}