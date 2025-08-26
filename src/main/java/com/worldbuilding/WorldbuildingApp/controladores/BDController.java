package com.worldbuilding.WorldbuildingApp.controladores;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.worldbuilding.WorldbuildingApp.MetodosBaseDatos;
import com.worldbuilding.WorldbuildingApp.modelos.*;

import jakarta.servlet.http.HttpSession;
import java.io.IOException;
import java.nio.file.*;
import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;


/**
 * Esta clase se encarga de realizar las operaciones lógicas de la base de datos del proyecto actual.
 * En lugar de insertar directamente en la DB, escribe llamadas a funciones SQL en el archivo .sql del proyecto activo.
 */
@RestController
@RequestMapping("/api/bd")
public class BDController implements MetodosBaseDatos{

    public ProyectoController proyectoActual;

    // Inyecta la ruta desde el properties
    @Value("${app.data-folder:./data}")
    private String dataFolder = "src/main/data";

    /**
     * Inserta datos en la tabla de un proyecto específico usando DatosTablaDTO.
     * @param requestBody Datos a insertar en formato JSON
     * @param session La sesión HTTP para obtener el proyecto activo
     * @return ResponseEntity con el resultado de la operación
     */
    @PutMapping("/insertar")
    @Override
    public ResponseEntity<?> insertarDatosDTO(@RequestBody Map<String, Object> requestBody, HttpSession session) {
        ResponseEntity<String> mensaje;
        try {
            // Obtener el proyecto activo
            String nombreProyecto = (String) session.getAttribute("proyectoActivo");
            if (nombreProyecto == null) {
                mensaje = ResponseEntity.badRequest().body("No hay proyecto activo");
                throw new DataException(mensaje.toString());
            }

            // Extraer datos del request
            String nombre = (String) requestBody.get("nombre");
            String apellidos = (String) requestBody.get("apellidos");
            String tipo = (String) requestBody.get("tipo");
            String descripcion = (String) requestBody.get("descripcion");
            
            // Determinar el tipo de tabla basado en los datos recibidos
            String tipoTabla = determinarTipoTabla(requestBody);
            
            // Crear array de valores extra según el tipo de tabla
            String[] valoresExtraTabla = crearValoresExtraTabla(tipoTabla, requestBody);
            
            // Crear DTO con los datos
            DatosTablaDTO<ProyectoDTO> datosDTO = new DatosTablaDTO<>(
                null, nombre, apellidos, tipo, descripcion, valoresExtraTabla
            );
            
            // Generar la operación SQL
            String operacionSQL = generarOperacionSQL(tipoTabla, datosDTO);
            
            // Agregar la operación al archivo SQL del proyecto
            agregarOperacionAlArchivo(nombreProyecto, operacionSQL);
            
            mensaje = ResponseEntity.ok("Datos insertados correctamente en " + tipoTabla + " del proyecto '" + nombreProyecto + "'");
            
        } catch (DataException e) {
            mensaje = ResponseEntity.badRequest().body("Error en los datos: " + e.getMessage());
        } catch (Exception e) {
            mensaje = ResponseEntity.internalServerError().body("Error interno: " + e.getMessage());
        }
        return mensaje;
    }

    /**
     * Borra datos llamando a las funciones SQL dentro del archivo .sql del proyecto activo
     * @param requestBody Datos para identificar qué eliminar
     * @param session La sesión HTTP para obtener el proyecto activo
     * @return ResponseEntity con el resultado de la operación
     */
    @DeleteMapping("/eliminar")
    @Override
    public ResponseEntity<?> eliminarDatosDTO(@RequestBody Map<String, Object> requestBody, HttpSession session) {
        ResponseEntity<String> mensaje;
        try {
            String nombreProyecto = (String) session.getAttribute("proyectoActivo");
            if (nombreProyecto == null) {
                mensaje = ResponseEntity.badRequest().body("No hay proyecto activo");
                throw new Exception();
            }

            Long id = Long.valueOf(requestBody.get("id").toString());
            String tipoTabla = (String) requestBody.get("tipoTabla");
            
            // Generar la operación SQL de eliminación
            String operacionSQL = "DELETE FROM " + tipoTabla + " WHERE id = " + id + ";";
            
            // Agregar la operación al archivo SQL del proyecto
            agregarOperacionAlArchivo(nombreProyecto, operacionSQL);
            
            mensaje = ResponseEntity.ok("Datos eliminados correctamente de " + tipoTabla + " del proyecto '" + nombreProyecto + "'");
            
        } catch (Exception e) {
            mensaje = ResponseEntity.internalServerError().body("Error al eliminar: " + e.getMessage());
        }
        return mensaje;
    }

    @GetMapping("/obtener")
    @Override
    public ResponseEntity<?> obtenerDatosDTO(@RequestBody Map<String, Object> requestBody, HttpSession session){
        ResponseEntity<String> mensaje;
        try {
            
            String nombreProyecto = (String) session.getAttribute("proyectoActivo");
            if (nombreProyecto == null) {
                mensaje = ResponseEntity.badRequest().body("No hay proyecto activo");
                throw new Exception();
            }

            Long id = Long.valueOf(requestBody.get("id").toString());
            String tipoTabla = (String) requestBody.get("tipoTabla");

            // Generar la operación SQL de eliminación
            String operacionSQL = "SELECT * FROM " + tipoTabla + " WHERE id = " + id + ";";
            
            // Agregar la operación al archivo SQL del proyecto
            agregarOperacionAlArchivo(nombreProyecto, operacionSQL);
            mensaje = ResponseEntity.ok("Datos eliminados correctamente de " + tipoTabla + " del proyecto '" + nombreProyecto + "'");

        } catch (Exception e) {
            mensaje = ResponseEntity.internalServerError().body("Error al obtener datos de: " + e.getMessage());
        }
        return mensaje;
    }

    /**
     * Función para activar o desactivar nodos 
     * @param requestBody Datos para modificar
     * @param session La sesión HTTP para obtener el proyecto activo
     * @return ResponseEntity con el resultado de la operación
     */
    @PatchMapping("/modificar")
    @Override
    public ResponseEntity<?> modificarDatosDTO(@RequestBody Map<String, Object> requestBody, HttpSession session) {
        ResponseEntity<String> mensaje;
        try {
            String nombreProyecto = (String) session.getAttribute("proyectoActivo");
            if (nombreProyecto == null) {
                mensaje = ResponseEntity.badRequest().body("No hay proyecto activo");
                throw new Exception();
            }

            Long id = Long.valueOf(requestBody.get("id").toString());
            String tipoTabla = (String) requestBody.get("tipoTabla");
            Boolean activo = (Boolean) requestBody.get("activo");
            
            // Generar la operación SQL de modificación
            String operacionSQL = "UPDATE " + tipoTabla + " SET es_nodo = " + activo + " WHERE id = " + id + ";";
            
            // Agregar la operación al archivo SQL del proyecto
            agregarOperacionAlArchivo(nombreProyecto, operacionSQL);
            
            mensaje = ResponseEntity.ok("Datos modificados correctamente en " + tipoTabla + " del proyecto '" + nombreProyecto + "'");
            
        } catch (Exception e) {
            mensaje = ResponseEntity.internalServerError().body("Error al modificar: " + e.getMessage());
        }
        return mensaje;
    }

    /**
     * Función para relacionar elementos entre sí
     * @param request DatosTablaDTO con la información de la relación
     * @param session La sesión HTTP para obtener el proyecto activo
     * @return ResponseEntity con el resultado de la operación
     */
    @PostMapping("/relacionar")
    public ResponseEntity<?> relacionarElementos(@RequestBody DatosTablaDTO<ProyectoDTO> request, HttpSession session) {
        ResponseEntity<String> mensaje;
        try {
            String nombreProyecto = (String) session.getAttribute("proyectoActivo");
            if (nombreProyecto == null) {
                mensaje = ResponseEntity.badRequest().body("No hay proyecto activo");
                throw new Exception();
            }

            // Generar la operación SQL para crear relaciones
            String operacionSQL = generarOperacionRelacionSQL(request);
            
            // Agregar la operación al archivo SQL del proyecto
            agregarOperacionAlArchivo(nombreProyecto, operacionSQL);
            
            mensaje = ResponseEntity.ok("Elementos relacionados correctamente en el proyecto '" + nombreProyecto + "'");
        } catch (Exception e) {
            mensaje = ResponseEntity.internalServerError().body("Error al relacionar: " + e.getMessage());
        }
        return mensaje;
    }

    /**
     * Endpoint para obtener el proyecto activo
     * @param session La sesión HTTP
     * @return ResponseEntity con el proyecto activo
     */
    @GetMapping("/activo")
    public ResponseEntity<?> obtenerProyectoActivo(HttpSession session) {
        ResponseEntity<?> mensaje;
        try {
            String nombre = (String) session.getAttribute("proyectoActivo");
            String enfoque = (String) session.getAttribute("enfoqueProyectoActivo");
            
            if (nombre != null && enfoque != null) {
                ProyectoDTO proyecto = new ProyectoDTO(nombre, enfoque);
                mensaje = ResponseEntity.ok(proyecto);
            } else {
                mensaje = ResponseEntity.status(404).body("No hay proyecto activo");
            }
        } catch (Exception e) {
            mensaje = ResponseEntity.internalServerError().body("Error al obtener proyecto activo: " + e.getMessage());
        }
        return mensaje;
    }

    /**
     * Determina el tipo de tabla basado en los datos recibidos
     * @param requestBody Datos del request
     * @return String con el tipo de tabla
     */
    private String determinarTipoTabla(Map<String, Object> requestBody) {
        String tipo = "";
        // Determinar tipo basado en los campos específicos presentes
        if (requestBody.containsKey("estado") && requestBody.containsKey("origen") && requestBody.containsKey("comportamiento")) {
            if (requestBody.get("Entidad").equals("EntidadIndividual")) {
                tipo = "entidadIndividual";
            } else{
                tipo = "entidadColectiva";
            }
        } else if (requestBody.containsKey("tamano") && requestBody.containsKey("desarrollo")) {
            tipo = "construccion";
        } else if (requestBody.containsKey("origen") && requestBody.containsKey("dureza")) {
            tipo = "efectos";
        } else if (requestBody.containsKey("direccion") && requestBody.containsKey("afectados")) {
            tipo = "interaccion";
        } else {
            tipo = "zona"; // Por defecto
        }
        return tipo;
    }

    /**
     * Crea el array de valores extra según el tipo de tabla
     * @param tipoTabla Tipo de tabla
     * @param requestBody Datos del request
     * @return Array de valores extra
     */
    private String[] crearValoresExtraTabla(String tipoTabla, Map<String, Object> requestBody) {
        switch (tipoTabla) {
            case "entidadIndividual":
            case "entidadColectiva":
                return new String[]{
                    tipoTabla,
                    (String) requestBody.get("estado"),
                    (String) requestBody.get("origen"),
                    (String) requestBody.get("comportamiento")
                };
            case "construccion":
            case "zona":
                return new String[]{
                    tipoTabla,
                    (String) requestBody.get("tamano"),
                    (String) requestBody.get("desarrollo")
                };
            case "efectos":
                return new String[]{
                    tipoTabla,
                    (String) requestBody.get("origen"),
                    (String) requestBody.get("dureza"),
                    (String) requestBody.get("comportamiento")
                };
            case "interaccion":
                return new String[]{
                    tipoTabla,
                    (String) requestBody.get("direccion"),
                    (String) requestBody.get("afectados")
                };
            default:
                throw new IllegalArgumentException("Tipo de tabla no reconocido: " + tipoTabla);
        }
    }

    /**
     * Genera la operación SQL para insertar datos
     * @param tipoTabla Tipo de tabla
     * @param datosDTO DTO con los datos
     * @return String con la operación SQL
     */
    private String generarOperacionSQL(String tipoTabla, DatosTablaDTO<ProyectoDTO> datosDTO) {
        StringBuilder sql = new StringBuilder();
        sql.append("INSERT INTO ").append(tipoTabla).append(" (nombre, apellidos, tipo, descripcion");
        
        // Agregar campos específicos según el tipo de tabla
        switch (tipoTabla) {
            case "entidadIndividual":
            case "entidadColectiva":
                sql.append(", estado, origen, comportamiento");
                break;
            case "construccion":
            case "zona":
                sql.append(", tamanno, desarrollo");
                break;
            case "efectos":
                sql.append(", origen, dureza, comportamiento");
                break;
            case "interaccion":
                sql.append(", direccion, afectados");
                break;
        }
        
        sql.append(") VALUES (");
        sql.append("'").append(escapeSQL(datosDTO.getNombre())).append("', ");
        sql.append("'").append(escapeSQL(datosDTO.getApellidos())).append("', ");
        sql.append("'").append(escapeSQL(datosDTO.getTipo())).append("', ");
        sql.append("'").append(escapeSQL(datosDTO.getDescripcion())).append("'");
        
        // Agregar valores específicos según el tipo de tabla
        switch (tipoTabla) {
            case "entidadIndividual":
            case "entidadColectiva":
                sql.append(", '").append(escapeSQL(datosDTO.getEstado())).append("'");
                sql.append(", '").append(escapeSQL(datosDTO.getOrigen_entidad())).append("'");
                sql.append(", '").append(escapeSQL(datosDTO.getComportamiento_entidad())).append("'");
                break;
            case "construccion":
                sql.append(", '").append(escapeSQL(datosDTO.getTamanno_cons())).append("'");
                sql.append(", '").append(escapeSQL(datosDTO.getDesarrollo_cons())).append("'");
                break;
            case "zona":
                sql.append(", '").append(escapeSQL(datosDTO.getTamanno_zona())).append("'");
                sql.append(", '").append(escapeSQL(datosDTO.getDesarrollo_zona())).append("'");
                break;
            case "efectos":
                sql.append(", '").append(escapeSQL(datosDTO.getOrigen_efecto())).append("'");
                sql.append(", '").append(escapeSQL(datosDTO.getDureza())).append("'");
                sql.append(", '").append(escapeSQL(datosDTO.getComportamiento_efecto())).append("'");
                break;
            case "interaccion":
                sql.append(", '").append(escapeSQL(datosDTO.getDireccion())).append("'");
                sql.append(", '").append(escapeSQL(datosDTO.getAfectados())).append("'");
                break;
        }
        
        sql.append(");");
        return sql.toString();
    }

    /**
     * Genera la operación SQL para crear relaciones
     * @param request DTO con los datos de la relación
     * @return String con la operación SQL
     */
    private String generarOperacionRelacionSQL(DatosTablaDTO<ProyectoDTO> request) {
        // Aquí se implementaría la lógica para generar SQL de relaciones
        // Por ahora retornamos un placeholder
        return "-- Operación de relación: " + request.getNombre() + " -> " + request.getDescripcion();
    }

    /**
     * Escapa caracteres especiales en SQL
     * @param value Valor a escapar
     * @return Valor escapado
     */
    private String escapeSQL(String value) {
        return (value == null) ? "" : value.replace("'", "''").replace("\\", "\\\\");
    }

    /**
     * Agrega una operación SQL al archivo del proyecto
     * @param nombreProyecto Nombre del proyecto
     * @param operacionSQL Operación SQL a agregar
     * @throws IOException Si hay error al escribir el archivo
     */
    private void agregarOperacionAlArchivo(String nombreProyecto, String operacionSQL) throws IOException {
        Path archivoSQL = Paths.get(dataFolder, nombreProyecto + ".sql");
        
        if (!Files.exists(archivoSQL)) {
            throw new IOException("Archivo del proyecto no encontrado: " + nombreProyecto + ".sql");
        }

        // Leer el contenido actual
        String contenidoActual = Files.readString(archivoSQL);
        
        // Agregar la nueva operación al final del archivo
        String nuevaOperacion = "\n-- Operación agregada: " + java.time.LocalDateTime.now() + "\n";
        nuevaOperacion += operacionSQL + "\n";
        
        // Escribir el archivo actualizado ; StandardOpenOption.WRITE, StandardOpenOption.TRUNCATE_EXISTING
        Files.writeString(archivoSQL, contenidoActual + nuevaOperacion, StandardOpenOption.APPEND);
    }
}