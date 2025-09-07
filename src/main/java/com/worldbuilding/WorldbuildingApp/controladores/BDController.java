package com.worldbuilding.WorldbuildingApp.controladores;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.worldbuilding.WorldbuildingApp.servicios.DatabaseService;

import com.worldbuilding.WorldbuildingApp.MetodosBaseDatos;
import com.worldbuilding.WorldbuildingApp.modelos.*;

import jakarta.servlet.http.HttpSession;
import java.io.IOException;
import java.nio.file.*;
import java.util.*;
import java.util.regex.*;
import org.springframework.web.bind.annotation.GetMapping;


/**
 * Esta clase se encarga de realizar las operaciones lógicas de la base de datos del proyecto actual.
 * En lugar de insertar directamente en la DB, escribe llamadas a funciones SQL en el archivo .sql del proyecto activo.
 */
@RestController
@RequestMapping("/api/bd")
public class BDController implements MetodosBaseDatos{

    public ProyectoController proyectoActual;

    @Autowired
    private DatabaseService databaseService;

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
            // Log detallado de los datos recibidos
            System.out.println("\n=== INICIANDO INSERCIÓN DE DATOS ===");
            System.out.println("Datos recibidos completos: " + requestBody);
            System.out.println("Campos encontrados: " + String.join(", ", requestBody.keySet()));
            requestBody.forEach((key, value) -> System.out.println(key + ": " + value));
            
            // Obtener el proyecto activo
            String nombreProyecto = (String) session.getAttribute("proyectoActivo");
            System.out.println("\nProyecto activo: " + nombreProyecto);
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
            System.out.println("\nTipo de tabla determinado: " + tipoTabla);
            
            // Crear array de valores extra según el tipo de tabla
            String[] valoresExtraTabla = crearValoresExtraTabla(tipoTabla, requestBody);
            System.out.println("Valores extra creados: " + String.join(", ", valoresExtraTabla));
            
            // Crear DTO con los datos
            DatosTablaDTO<ProyectoDTO> datosDTO = new DatosTablaDTO<>(
                null, nombre, apellidos, tipo, descripcion, valoresExtraTabla
            );
            System.out.println("\nDTO creado con datos:");
            System.out.println("Nombre: " + datosDTO.getNombre());
            System.out.println("Apellidos: " + datosDTO.getApellidos());
            System.out.println("Tipo: " + datosDTO.getTipo());
            System.out.println("Descripción: " + datosDTO.getDescripcion());
            
            // Generar la operación SQL
            String operacionSQL = generarOperacionSQL(tipoTabla, datosDTO);
            System.out.println("\nOperación SQL generada: " + operacionSQL);
            
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

    /**
     * Método para agregar una operación SQL al archivo del proyecto
     * @param nombreProyecto Nombre del proyecto al que agregar la operación
     * @param operacionSQL La operación SQL a agregar
     * @throws IOException Si hay error al escribir el archivo
     */
    public void agregarOperacionAArchivo(String nombreProyecto, String operacionSQL) throws IOException {
        Path archivoSQL = Paths.get(dataFolder, nombreProyecto + ".sql");
        
        if (!Files.exists(archivoSQL)) {
            throw new IOException("Archivo del proyecto no encontrado: " + nombreProyecto + ".sql");
        }

        // Agregar la nueva operación al final del archivo
        String nuevaOperacion = "\n-- Operación agregada: " + java.time.LocalDateTime.now() + "\n";
        nuevaOperacion += operacionSQL + "\n";
        
        // Escribir el archivo actualizado
        Files.writeString(archivoSQL, nuevaOperacion, StandardOpenOption.APPEND);
        
        // Ejecutar la operación SQL en la base de datos
        databaseService.ejecutarSQL(operacionSQL);
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
        String tabla = "No se pudo determinar el tipo de tabla";
        // Si tiene estado y comportamiento, es una entidad
        if (requestBody.containsKey("estado") && requestBody.containsKey("comportamiento")) {
            tabla = requestBody.containsKey("colectivo") ? "Entidad-Colectiva" : "Entidad-Individual";
        } 
        // Si tiene tamaño y desarrollo
        else if (requestBody.containsKey("tamano") && requestBody.containsKey("desarrollo")) {
            tabla = requestBody.containsKey("esZona") ? "Zona" : "Construccion";
        } 
        // Si tiene origen y dureza es un efecto
        else if (requestBody.containsKey("origen") && requestBody.containsKey("dureza")) {
            tabla = "Efecto";
        } 
        // Si tiene dirección y afectados es una relación
        else if (requestBody.containsKey("direccion") && requestBody.containsKey("afectados")) {
            tabla = "Relacion";
        } else{
            throw new IllegalArgumentException("No se pudo determinar el tipo de tabla");
        }
        return tabla;
    }

    /**
     * Crea el array de valores extra según el tipo de tabla
     * @param tipoTabla Tipo de tabla
     * @param requestBody Datos del request
     * @return Array de valores extra
     */
    private String[] crearValoresExtraTabla(String tipoTabla, Map<String, Object> requestBody) {
        switch (tipoTabla) {
            case "Entidad-Individual":
            case "Entidad-Colectiva":
                return new String[]{
                    tipoTabla,  // Tipo exacto que espera el DTO
                    (String) requestBody.get("estado"),
                    (String) requestBody.get("origen"),
                    (String) requestBody.get("comportamiento")
                };
            case "Construccion":
            case "Zona":
                return new String[]{
                    tipoTabla,  // Tipo exacto que espera el DTO
                    (String) requestBody.get("tamano"),
                    (String) requestBody.get("desarrollo")
                };
            case "Efecto":
                return new String[]{
                    "efectos",  // Nombre exacto de la tabla en DB
                    (String) requestBody.get("origen"),
                    (String) requestBody.get("dureza"),
                    (String) requestBody.get("comportamiento")
                };
            case "Relacion":
                return new String[]{
                    "interaccion",  // Nombre exacto de la tabla en DB
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
        // Usar el nombre exacto de la tabla según el tipo
        String nombreTablaSQL;
        switch (tipoTabla) {
            case "Entidad-Individual":
                nombreTablaSQL = "entidadIndividual";
                break;
            case "Entidad-Colectiva":
                nombreTablaSQL = "entidadColectiva";
                break;
            case "Efecto":
                nombreTablaSQL = "efectos";
                break;
            case "Relacion":
                nombreTablaSQL = "interaccion";
                break;
            default:
                nombreTablaSQL = tipoTabla.toLowerCase();
        }

        sql.append("INSERT INTO ").append(nombreTablaSQL).append(" (");
        
        // Agregar campos específicos según el tipo de tabla
        switch (tipoTabla) {
            case "Entidad-Individual":
            case "Entidad-Colectiva":
                sql.append("nombre, apellidos, estado, tipo, origen, comportamiento, descripcion");
                break;
            case "Construccion":
            case "Zona":
                sql.append("nombre, apellidos, tamanno, tipo, desarrollo, descripcion");
                break;
            case "Efecto":
                sql.append("nombre, apellidos, origen, dureza, comportamiento, descripcion");
                break;
            case "Relacion":
                sql.append("nombre, apellidos, direccion, tipo, afectados, descripcion");
                break;
        }
        
        sql.append(") VALUES (");
        
        // Agregar valores específicos según el tipo de tabla
        switch (tipoTabla) {
            case "Entidad-Individual":
            case "Entidad-Colectiva":
                sql.append("'").append(escapeSQL(datosDTO.getNombre())).append("', ");
                sql.append("'").append(escapeSQL(datosDTO.getApellidos())).append("', ");
                sql.append("'").append(escapeSQL(datosDTO.getEstado())).append("', ");
                sql.append("'").append(escapeSQL(datosDTO.getTipo())).append("', ");
                sql.append("'").append(escapeSQL(datosDTO.getOrigen_entidad())).append("', ");
                sql.append("'").append(escapeSQL(datosDTO.getComportamiento_entidad())).append("', ");
                sql.append("'").append(escapeSQL(datosDTO.getDescripcion())).append("'");
                break;
            case "Construccion":
            case "Zona":
                sql.append("'").append(escapeSQL(datosDTO.getNombre())).append("', ");
                sql.append("'").append(escapeSQL(datosDTO.getApellidos())).append("', ");
                sql.append("'").append(escapeSQL(datosDTO.getTamanno_cons())).append("', ");
                sql.append("'").append(escapeSQL(datosDTO.getTipo())).append("', ");
                sql.append("'").append(escapeSQL(datosDTO.getDesarrollo_cons())).append("', ");
                sql.append("'").append(escapeSQL(datosDTO.getDescripcion())).append("'");
                break;
            case "Efecto":
                sql.append("'").append(escapeSQL(datosDTO.getNombre())).append("', ");
                sql.append("'").append(escapeSQL(datosDTO.getApellidos())).append("', ");
                sql.append("'").append(escapeSQL(datosDTO.getOrigen_efecto())).append("', ");
                sql.append("'").append(escapeSQL(datosDTO.getDureza())).append("', ");
                sql.append("'").append(escapeSQL(datosDTO.getComportamiento_efecto())).append("', ");
                sql.append("'").append(escapeSQL(datosDTO.getDescripcion())).append("'");
                break;
            case "Relacion":
                sql.append("'").append(escapeSQL(datosDTO.getNombre())).append("', ");
                sql.append("'").append(escapeSQL(datosDTO.getApellidos())).append("', ");
                sql.append("'").append(escapeSQL(datosDTO.getDireccion())).append("', ");
                sql.append("'").append(escapeSQL(datosDTO.getTipo())).append("', ");
                sql.append("'").append(escapeSQL(datosDTO.getAfectados())).append("', ");
                sql.append("'").append(escapeSQL(datosDTO.getDescripcion())).append("'");
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
     * Método auxiliar para extraer datos de una tabla específica del contenido SQL
     * @param contenidoSQL El contenido del archivo SQL
     * @param nombreTabla El nombre de la tabla a extraer
     * @return Lista de mapas con los datos de la tabla
     */
    public List<Map<String, Object>> extraerDatosDeTabla(String contenidoSQL, String nombreTabla) {
        List<Map<String, Object>> datos = new ArrayList<>();
        
        // Patrón mejorado para encontrar INSERT INTO tabla (columnas) VALUES (valores);
        // Maneja múltiples líneas y espacios
        String patron = "INSERT\\s+INTO\\s+" + nombreTabla + "\\s*\\(([^)]+)\\)\\s*VALUES\\s*\\(([^)]+)\\);";
        Pattern pattern = Pattern.compile(patron, Pattern.CASE_INSENSITIVE | Pattern.DOTALL);
        Matcher matcher = pattern.matcher(contenidoSQL);
        
        while (matcher.find()) {
            String columnasStr = matcher.group(1);
            String valoresStr = matcher.group(2);
            
            // Parsear columnas
            String[] columnas = columnasStr.split(",");
            for (int i = 0; i < columnas.length; i++) {
                columnas[i] = columnas[i].trim();
            }
            
            // Parsear valores
            String[] valores = parsearValoresSQL(valoresStr);
            
            // Crear mapa de datos
            Map<String, Object> fila = new HashMap<>();
            for (int i = 0; i < columnas.length && i < valores.length; i++) {
                // Limpiar comillas de los valores
                String valor = valores[i];
                if (valor.startsWith("'") && valor.endsWith("'")) {
                    valor = valor.substring(1, valor.length() - 1);
                }
                fila.put(columnas[i], valor);
            }
            
            datos.add(fila);
        }
        
        return datos;
    }

    /**
     * Método auxiliar para parsear valores SQL
     * @param valoresStr String con los valores separados por comas
     * @return Array of strings with the parsed values
     */
    private String[] parsearValoresSQL(String valoresStr) {
        List<String> valores = new ArrayList<>();
        StringBuilder valorActual = new StringBuilder();
        boolean dentroComillas = false;
        boolean escape = false;
        char c;
        for (int i = 0; i < valoresStr.length(); i++) {
            c = valoresStr.charAt(i);
            
            if (escape) {
                valorActual.append(c);
                escape = false;
            }
            
            if (c == '\\') {
                escape = true;
            }
            
            if (c == '\'') {
                dentroComillas = !dentroComillas;
                valorActual.append(c);
            }
            
            if (c == ',' && !dentroComillas) {
                valores.add(valorActual.toString().trim());
                valorActual = new StringBuilder();
            }
            
            valorActual.append(c);
        }
        
        // Agregar el último valor
        if (valorActual.length() > 0) {
            valores.add(valorActual.toString().trim());
        }
        
        return valores.toArray(new String[0]);
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
        
        System.out.println("Intentando escribir en: " + archivoSQL.toAbsolutePath());
        System.out.println("Operación SQL: " + operacionSQL);
        
        if (!Files.exists(archivoSQL)) {
            System.out.println("¡Archivo no encontrado!");
            throw new IOException("Archivo del proyecto no encontrado: " + nombreProyecto + ".sql");
        }
        
        // Agregar la nueva operación al final del archivo
        String nuevaOperacion = "\n-- Operación agregada: " + java.time.LocalDateTime.now() + "\n";
        nuevaOperacion += operacionSQL + "\n";
        
        try {
            // Verificar permisos de escritura
            if (!Files.isWritable(archivoSQL)) {
                System.out.println("¡No hay permisos de escritura en el archivo!");
                throw new IOException("No hay permisos de escritura en: " + archivoSQL);
            }
            
            // Escribir el archivo con APPEND para añadir al final
            Files.writeString(archivoSQL, nuevaOperacion, StandardOpenOption.APPEND);
            System.out.println("Escritura exitosa en el archivo SQL");
            
            // Ejecutar la operación SQL en la base de datos
            try {
                databaseService.ejecutarSQL(operacionSQL);
                System.out.println("Operación SQL ejecutada exitosamente en la base de datos");
            } catch (Exception e) {
                System.out.println("Error al ejecutar SQL en la base de datos: " + e.getMessage());
                throw new IOException("Error al ejecutar SQL: " + e.getMessage(), e);
            }
        } catch (IOException e) {
            System.out.println("Error al escribir: " + e.getMessage());
            throw e;
        }
    }
}