package com.worldbuilding.WorldbuildingApp.controladores;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.worldbuilding.WorldbuildingApp.ParametrosBaseDatos;
import com.worldbuilding.WorldbuildingApp.modelos.*;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardOpenOption;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Esta clase se encarga de realizar las operaciones lógicas de la base de datos del proyecto actual.
 * En lugar de insertar directamente en la DB, escribe llamadas a funciones SQL en el archivo .sql del proyecto activo.
 */
@RestController
@RequestMapping("/api/bd")
public class BDController {

    private static final Logger logger = LoggerFactory.getLogger(BDController.class);

    // Inyecta la ruta desde el properties
    @Value("${app.data-folder:./data}")
    private String dataFolder = "src/main/data";

    // Mapa: proyecto -> (tabla -> parámetros de la tabla)
    private Map<String, Map<String, List<ParametrosBaseDatos>>> proyectosTablas = new HashMap<>();

    /**
     * Inserta datos en la tabla de un proyecto específico.
     * @param proyecto Nombre del proyecto activo
     * @param tabla Nombre de la tabla
     * @param datos Datos a insertar
     */
    @PutMapping("/insertar")
    public ResponseEntity<?> insertarDatosDB(@RequestParam String proyecto, @RequestParam String tabla, @RequestBody Map<String, String> datos) {
        try {
            // Obtener el mapa de tablas del proyecto
            Map<String, List<ParametrosBaseDatos>> tablas = proyectosTablas.get(proyecto);
            if (tablas == null) throw new RuntimeException("Proyecto no encontrado");

            // Obtener la lista de registros de la tabla
            List<ParametrosBaseDatos> registros = tablas.get(tabla);
            if (registros == null) throw new RuntimeException("Tabla no encontrada");

            // Crear el objeto adecuado según la tabla
            ParametrosBaseDatos nuevoRegistro = crearObjetoDesdeDatos(tabla, datos);

            // Añadir el registro a la lista
            registros.add(nuevoRegistro);

            // Escribir la inserción en el archivo SQL del proyecto
            escribirInsercionSQL(proyecto, tabla, nuevoRegistro);

            return ResponseEntity.ok("Datos insertados correctamente");
        } catch (Exception e) {
            logger.error("Error al insertar datos", e);
            return ResponseEntity.status(500).body("Error interno");
        }
    }

    /**
     * Borra datos llamando a las funciones SQL dentro del archivo .sql del proyecto activo
     * @param tabla
     * @param identificador
     * @param session
     * @return
     */
    @DeleteMapping("/borrar")
    public ResponseEntity<?> borrarDatosDB() {

        return ResponseEntity.ok("Datos borrados correctamente");
    }

    /**
     * Función para activar o desactivar nodos 
     * @param tabla
     * @param identificador
     * @param activo
     * @param session
     * @return
     */
    @PatchMapping("/cambiarEstado")
    public ResponseEntity<?> cambiarEstadoNodo() {

        return ResponseEntity.ok("Estado cambiado correctamente");
    }

    /**
     * Función para relacionar elementos entre sí
     * @param origen
     * @param destino
     * @param tipoRelacion
     * @param session
     * @return
     */
    @PostMapping("/relacionar")
    public ResponseEntity<?> relacionarElementos() {

        return ResponseEntity.ok("Elementos relacionados correctamente");
    }

    // Endpoint para exponer la ruta dataFolder al frontend
    @GetMapping("/api/config")
    public Map<String, String> getConfig() {
        return Map.of("dataFolder", dataFolder);
    }

    private ParametrosBaseDatos crearObjetoDesdeDatos(String tabla, Map<String, String> datos) {
        switch (tabla) {
            case "EntidadIndividual":
                return new EntidadIndividual(
                    Long.valueOf(datos.get("id")),
                    datos.get("nombre"),
                    datos.get("apellidos"),
                    datos.get("estado"),
                    datos.get("tipo"),
                    datos.get("origen"),
                    datos.get("comportamiento"),
                    datos.get("descripcion")
                );
            case "EntidadColectiva":
                return new EntidadIndividual(
                    Long.valueOf(datos.get("id")),
                    datos.get("nombre"),
                    datos.get("apellidos"),
                    datos.get("estado"),
                    datos.get("tipo"),
                    datos.get("origen"),
                    datos.get("comportamiento"),
                    datos.get("descripcion")
                );
            case "Efectos":
                return new Efectos(
                    Long.valueOf(datos.get("id")),
                    datos.get("nombre"),
                    datos.get("apellidos"),
                    datos.get("origen"),
                    datos.get("dureza"),
                    datos.get("comportamiento"),
                    datos.get("descripcion")
                );
            case "Construccion":
                return new Construccion(
                    Long.valueOf(datos.get("id")),
                    datos.get("nombre"),
                    datos.get("apellidos"),
                    datos.get("tamanno"),
                    datos.get("tipo"),
                    datos.get("desarrollo"),
                    datos.get("descripcion")
                );
            case "Zona":
                return new Zona(
                    Long.valueOf(datos.get("id")),
                    datos.get("nombre"),
                    datos.get("apellidos"),
                    datos.get("tamanno"),
                    datos.get("tipo"),
                    datos.get("desarrollo"),
                    datos.get("descripcion")
                );
            case "Interaccion":
                return new Interaccion(
                    Long.valueOf(datos.get("id")),
                    datos.get("nombre"),
                    datos.get("apellidos"),
                    datos.get("tamanno"),
                    datos.get("tipo"),
                    datos.get("desarrollo"),
                    datos.get("descripcion")
                );
            // ...y así para el resto de modelos
            default:
                throw new IllegalArgumentException("Tabla desconocida: " + tabla);
        }
    }

    private void escribirInsercionSQL(String proyecto, String tabla, ParametrosBaseDatos registro) {
        try {
            Path folderPath = Paths.get(dataFolder);
            if (!Files.exists(folderPath)) {
                Files.createDirectories(folderPath);
            }
            String archivoSQL = dataFolder + "/" + proyecto + ".sql";
            Path path = Paths.get(archivoSQL);
            boolean archivoExiste = Files.exists(path);
            StringBuilder sb = new StringBuilder();
            if (!archivoExiste) {
                sb.append("use worldbuilding;\n\n-- Inserciones de datos\n");
            }
            sb.append(generarInsertSQL(tabla, registro)).append("\n");
            Files.writeString(path, sb.toString(), archivoExiste ? StandardOpenOption.APPEND : StandardOpenOption.CREATE);
            logger.info("Escrito en archivo SQL: " + archivoSQL);
        } catch (IOException e) {
            logger.error("Error al escribir la inserción SQL", e);
        }
    }

    private String generarInsertSQL(String tabla, ParametrosBaseDatos registro) {
        switch (tabla) {
            case "Construccion": {
                com.worldbuilding.WorldbuildingApp.modelos.Construccion c = (com.worldbuilding.WorldbuildingApp.modelos.Construccion) registro;
                return String.format("INSERT INTO construccion (id, nombre, apellidos, tamanno, tipo, desarrollo, descripcion) VALUES (%d, '%s', '%s', '%s', '%s', '%s', '%s');",
                        c.getId(), c.getNombre(), c.getApellidos(), c.getTamanno(), c.getTipo(), c.getDesarrollo(), c.getDescripcion());
            }
            case "Zona": {
                com.worldbuilding.WorldbuildingApp.modelos.Zona z = (com.worldbuilding.WorldbuildingApp.modelos.Zona) registro;
                return String.format("INSERT INTO zona (id, nombre, apellidos, tamanno, tipo, desarrollo, descripcion) VALUES (%d, '%s', '%s', '%s', '%s', '%s', '%s');",
                        z.getId(), z.getNombre(), z.getApellidos(), z.getTamanno(), z.getTipo(), z.getDesarrollo(), z.getDescripcion());
            }
            // Agrega aquí el resto de modelos (EntidadIndividual, EntidadColectiva, Interaccion, Efectos)
            default:
                throw new IllegalArgumentException("Tabla desconocida para generación de SQL: " + tabla);
        }
    }
}