package com.worldbuilding.WorldbuildingApp.controladores;

import jakarta.servlet.http.HttpSession;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardOpenOption;
import java.util.Map;

/**
 * Esta clase se encarga de realizar las operaciones lógicas de la base de datos del proyecto actual.
 * En lugar de insertar directamente en la DB, escribe llamadas a funciones SQL en el archivo .sql del proyecto activo.
 */
@RestController
@RequestMapping("/api/bd")
public class BDController {

    private static final Logger logger = LoggerFactory.getLogger(BDController.class);
    // ADVERTENCIA: Esta ruta funcionará en el IDE, pero fallará al empaquetar en un JAR.
    private final String DATA_FOLDER = "src/main/resources/static/data";

    /**
     * Inserta datos llamando a las funciones SQL dentro del archivo .sql del proyecto activo
     * @param tabla número que identifica la función (0..5)
     * @param datos datos para la función SQL
     * @param session HttpSession para obtener proyecto activo
     * @return ResponseEntity con resultado
     */
    @PostMapping("/insertar")
    public ResponseEntity<?> insertarDatosDB(
            @RequestBody InsertarRequest request,
            HttpSession session) {

        int tabla = request.getTabla();
        Map<String, String> datos = request.getDatos();

        String proyectoActivo = (String) session.getAttribute("proyectoActivo");
        logger.info("Intento de inserción. Proyecto activo en sesión: '{}'", proyectoActivo);

        ResponseEntity<String> status;

        if (proyectoActivo == null) {
            status = ResponseEntity.status(400).body("No hay proyecto activo en sesión");
        } else {
            Path archivoSQL = Paths.get(DATA_FOLDER, proyectoActivo + ".sql");
            if (!Files.exists(archivoSQL)) {
                return ResponseEntity.status(404).body("Archivo SQL del proyecto activo no encontrado: " + archivoSQL.toAbsolutePath());
            }
            String llamadaFuncionSQL = llamadaFuncion(tabla, datos);
            logger.info("Ruta del archivo SQL: {}", archivoSQL.toAbsolutePath());

            if (llamadaFuncionSQL == null) {
                status = ResponseEntity.badRequest().body("Número de tabla inválido");
            } else {
                logger.info("Escribiendo comando SQL: {}", llamadaFuncionSQL);
                try {
                    Files.writeString(archivoSQL, llamadaFuncionSQL + "\n", StandardOpenOption.APPEND);
                    status = ResponseEntity.ok("Datos insertados correctamente en el archivo SQL");
                } catch (IOException e) {
                    status = ResponseEntity.status(500).body("Error escribiendo en el archivo SQL");
                }
            }
        }

        return status;
    }

    /**
     * Borra datos llamando a las funciones SQL dentro del archivo .sql del proyecto activo
     * @param tabla
     * @param identificador
     * @param session
     * @return
     */
    @PostMapping("/borrar")
    public ResponseEntity<?> borrarDatosDB(
            @RequestParam int tabla,
            @RequestParam String identificador, // ID o nombre de la entidad a borrar
            HttpSession session) {

        String proyectoActivo = (String) session.getAttribute("proyectoActivo");
        ResponseEntity<String> status;

        if (proyectoActivo == null) {
            status = ResponseEntity.badRequest().body("No hay proyecto activo en sesión");
        } else{
            Path archivoSQL = Paths.get(DATA_FOLDER, proyectoActivo + ".sql");
            if (!Files.exists(archivoSQL)) {
                return ResponseEntity.status(404).body("Archivo SQL del proyecto activo no encontrado");
            }
            String nombreFuncion = switch (tabla) {
                case 0 -> "borrarEntidadIndividual";
                case 1 -> "borrarEntidadColectiva";
                case 2 -> "borrarEfecto";
                case 3 -> "borrarConstruccion";
                case 4 -> "borrarZona";
                case 5 -> "borrarInteraccion";
                default -> null;
            };

            if (nombreFuncion == null) {
                status = ResponseEntity.badRequest().body("Tabla inválida");
            } else{
                String llamada = String.format("CALL %s('%s');", nombreFuncion, identificador.replace("'", "''"));
                try {
                    Files.writeString(archivoSQL, llamada + "\n", StandardOpenOption.APPEND);
                    status = ResponseEntity.ok("Borrado registrado correctamente");
                } catch (IOException e) {
                    status = ResponseEntity.status(500).body("Error escribiendo en el archivo SQL");
                }
            }
        }
        return status;
    }

    /**
     * Función para activar o desactivar nodos 
     * @param tabla
     * @param identificador
     * @param activo
     * @param session
     * @return
     */
    @PostMapping("/cambiarEstado")
    public ResponseEntity<?> cambiarEstadoNodo(
            @RequestParam int tabla,
            @RequestParam String identificador,
            @RequestParam boolean activo,
            HttpSession session) {

        String proyectoActivo = (String) session.getAttribute("proyectoActivo");
        ResponseEntity<String> status;

        if (proyectoActivo == null) {
            status = ResponseEntity.badRequest().body("No hay proyecto activo en sesión");
        } else{
            Path archivoSQL = Paths.get(DATA_FOLDER, proyectoActivo + ".sql");
            if (!Files.exists(archivoSQL)) {
                return ResponseEntity.status(404).body("Archivo SQL del proyecto activo no encontrado");
            }
            String nombreFuncion = switch (tabla) {
                case 0 -> "cambiarEstadoEntidadIndividual";
                case 1 -> "cambiarEstadoEntidadColectiva";
                case 2 -> "cambiarEstadoEfecto";
                case 3 -> "cambiarEstadoConstruccion";
                case 4 -> "cambiarEstadoZona";
                case 5 -> "cambiarEstadoInteraccion";
                default -> null;
            };
            if (nombreFuncion == null) {
                status =  ResponseEntity.badRequest().body("Tabla inválida");
            } else{
                String llamada = String.format(
                    "CALL %s('%s', %b);", 
                    nombreFuncion, 
                    identificador.replace("'", "''"), 
                    activo
                );
                try {
                    Files.writeString(archivoSQL, llamada + "\n", StandardOpenOption.APPEND);
                    status =  ResponseEntity.ok("Estado del nodo registrado correctamente");
                } catch (IOException e) {
                    status =  ResponseEntity.status(500).body("Error escribiendo en el archivo SQL");
                }
            }
        }
        return status;
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
    public ResponseEntity<?> relacionarElementos(
            @RequestParam String origen,
            @RequestParam String destino,
            @RequestParam String tipoRelacion, // puede ser amistad, dependencia, conexión, etc.
            HttpSession session) {

        String proyectoActivo = (String) session.getAttribute("proyectoActivo");
        ResponseEntity<String> status;

        if (proyectoActivo == null) {
            status = ResponseEntity.badRequest().body("No hay proyecto activo en sesión");
        } else{ 
            Path archivoSQL = Paths.get(DATA_FOLDER, proyectoActivo + ".sql");
            if (!Files.exists(archivoSQL)) {
                return ResponseEntity.status(404).body("Archivo SQL del proyecto activo no encontrado");
            }
            String llamada = String.format(
                "CALL crearRelacion('%s', '%s', '%s');",
                origen.replace("'", "''"),
                destino.replace("'", "''"),
                tipoRelacion.replace("'", "''")
            );
            try {
                Files.writeString(archivoSQL, llamada + "\n", StandardOpenOption.APPEND);
                status = ResponseEntity.ok("Relación registrada correctamente");
            } catch (IOException e) {
                status = ResponseEntity.status(500).body("Error escribiendo en el archivo SQL");
            }
        }
        return status;
    }

    /**
     * Construye la llamada a la función SQL según el número de tabla y los datos recibidos.
     * El formato depende de cómo tengas definidas las funciones SQL en el archivo.
     * Ejemplo: "CALL crearEntidadIndividual('dato1','dato2','dato3');"
     */
    private String llamadaFuncion(int tabla, Map<String, String> datos) {
        String funcion;
        switch (tabla) {
            case 0 -> funcion = construirLlamada("crearEntidadIndividual", datos);
            case 1 -> funcion = construirLlamada("crearEntidadColectiva", datos);
            case 2 -> funcion = construirLlamada("crearEfectos", datos);
            case 3 -> funcion = construirLlamada("crearConstruccion", datos);
            case 4 -> funcion = construirLlamada("crearZona", datos);
            case 5 -> funcion = construirLlamada("crearInteraccion", datos);
            default -> funcion = null;
        }
        return funcion;
    }

    /**
     * Construye el string con la llamada a la función SQL con los parámetros entre comillas simples y separados por coma.
     * Ejemplo de resultado: "CALL crearEntidadIndividual('valor1','valor2','valor3');"
     */
        private String construirLlamada(String nombreFuncion, Map<String, String> datos) {
        StringBuilder sb = new StringBuilder("CALL ");
        sb.append(nombreFuncion).append("(");

        int i = 0;
        for (String valor : datos.values()) {
            sb.append("'").append(valor.trim().replace("'", "''")).append("'");
            if (i < datos.size() - 1) {
                sb.append(", ");
            }
            i++;
        }

        sb.append(");");
        return sb.toString();
    }

}