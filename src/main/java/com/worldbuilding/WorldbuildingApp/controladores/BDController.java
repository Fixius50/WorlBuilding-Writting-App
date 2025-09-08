package com.worldbuilding.WorldbuildingApp.controladores;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

// import com.worldbuilding.WorldbuildingApp.servicios.DatabaseService;

import com.worldbuilding.WorldbuildingApp.MetodosBaseDatos;
import com.worldbuilding.WorldbuildingApp.modelos.*;
import com.worldbuilding.WorldbuildingApp.servicios.DatosTablaService;

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

    private DatosTablaService datosTablaService;

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
    public ResponseEntity<?> insertarDatosDTO(@RequestBody DatosTablaDTO datosDTO, HttpSession session) {
        ResponseEntity<String> mensaje;
        try {
            String nombreProyecto = (String) session.getAttribute("proyectoActivo");
            if (nombreProyecto == null) {
                return ResponseEntity.badRequest().body("No hay proyecto activo");
            }
            // Obtener el tipo de tabla desde el DTO
            String tipoTabla = datosDTO.getTipo();
            // ...
            // Obtener el siguiente ID disponible
            // Guardar el DTO usando el service JPA
            DatosTablaDTO guardado = datosTablaService.guardar(datosDTO);
            mensaje = ResponseEntity.ok("Datos insertados correctamente en " + tipoTabla + " del proyecto '" + nombreProyecto + "' (ID: " + guardado.getId() + ")");
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
    public ResponseEntity<?> eliminarDatosDTO(@RequestBody DatosTablaDTO datosDTO, HttpSession session) {
        ResponseEntity<String> mensaje;
        try {
            String nombreProyecto = (String) session.getAttribute("proyectoActivo");
            if (nombreProyecto == null) {
                return ResponseEntity.badRequest().body("No hay proyecto activo");
            }
            Long id = datosDTO.getId();
            String tipoTabla = datosDTO.getTipo();
            // ...
            datosTablaService.eliminar(id);
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
        
    // Si necesitas ejecutar la operación en la base de datos, implementa aquí la lógica usando JPA o ignora si solo es archivo.
    }

    @GetMapping("/obtener")
    @Override
    public ResponseEntity<?> obtenerDatosDTO(@RequestBody DatosTablaDTO datosDTO, HttpSession session){
        ResponseEntity<String> mensaje;
        try {
            String nombreProyecto = (String) session.getAttribute("proyectoActivo");
            if (nombreProyecto == null) {
                return ResponseEntity.badRequest().body("No hay proyecto activo");
            }
            Long id = datosDTO.getId();
            // ...
            Optional<DatosTablaDTO> resultado = datosTablaService.buscarPorId(id);
            if (resultado.isPresent()) {
                mensaje = ResponseEntity.ok(resultado.get().toString());
            } else {
                mensaje = ResponseEntity.status(404).body("No se encontró el registro con id " + id);
            }
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
    public ResponseEntity<?> modificarDatosDTO(@RequestBody DatosTablaDTO datosDTO, HttpSession session) {
        ResponseEntity<String> mensaje;
        try {
            String nombreProyecto = (String) session.getAttribute("proyectoActivo");
            if (nombreProyecto == null) {
                return ResponseEntity.badRequest().body("No hay proyecto activo");
            }
            Long id = datosDTO.getId();
            String tipoTabla = datosDTO.getTipo();
            // ...
            // Suponiendo que el DTO tiene un campo "activo" (ajustar si es diferente)
            // Si tienes un campo booleano en el DTO, usa el getter correspondiente. Si no, puedes ajustar aquí:
            // Actualizar el DTO (aquí podrías modificar campos según lógica)
            datosDTO.setId(id);
            DatosTablaDTO actualizado = datosTablaService.guardar(datosDTO);
            mensaje = ResponseEntity.ok("Datos modificados correctamente en " + tipoTabla + " del proyecto '" + nombreProyecto + "' (ID: " + actualizado.getId() + ")");
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
    public ResponseEntity<?> relacionarElementos(@RequestBody DatosTablaDTO datosDTO, HttpSession session) {
        ResponseEntity<String> mensaje;
        try {
            String nombreProyecto = (String) session.getAttribute("proyectoActivo");
            if (nombreProyecto == null) {
                return ResponseEntity.badRequest().body("No hay proyecto activo");
            }
            String operacionSQL = generarOperacionRelacionSQL(datosDTO);
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
                mensaje = ResponseEntity.ok(Map.of("nombre", nombre, "enfoque", enfoque));
            } else {
                mensaje = ResponseEntity.status(404).body("No hay proyecto activo");
            }
        } catch (Exception e) {
            mensaje = ResponseEntity.internalServerError().body("Error al obtener proyecto activo: " + e.getMessage());
        }
        return mensaje;
    }

    /**
     * Endpoint para verificar el estado de la base de datos
     * @return ResponseEntity con el estado de la conexión y las tablas
     */
    @GetMapping("/verificar")
    public ResponseEntity<?> verificarBaseDeDatos() {
    // Este endpoint debe ser adaptado a la nueva arquitectura JPA o eliminado si no aplica.
    return ResponseEntity.status(501).body("No implementado: verificación directa de la base de datos no soportada en este controlador");
    }


    /**
     * Genera la operación SQL para crear relaciones
     * @param request DTO con los datos de la relación
     * @return String con la operación SQL
     */
    private String generarOperacionRelacionSQL(DatosTablaDTO request) {
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
     * Agrega una operación SQL al archivo del proyecto
     * @param nombreProyecto Nombre del proyecto
     * @param operacionSQL Operación SQL a agregar
     * @throws IOException Si hay error al escribir el archivo
     */
    private void agregarOperacionAlArchivo(String nombreProyecto, String operacionSQL) throws IOException {
        Path archivoSQL = Paths.get(dataFolder, nombreProyecto + ".sql");
        
    // ...
        
        if (!Files.exists(archivoSQL)) {
            throw new IOException("Archivo del proyecto no encontrado: " + nombreProyecto + ".sql");
        }
        
        // Agregar la nueva operación al final del archivo
        String nuevaOperacion = "\n-- Operación agregada: " + java.time.LocalDateTime.now() + "\n";
        nuevaOperacion += operacionSQL + "\n";
        
        try {
            // Verificar permisos de escritura
            if (!Files.isWritable(archivoSQL)) {
                throw new IOException("No hay permisos de escritura en: " + archivoSQL);
            }
            // Escribir el archivo con APPEND para añadir al final
            Files.writeString(archivoSQL, nuevaOperacion, StandardOpenOption.APPEND);
            // Si necesitas ejecutar la operación en la base de datos, implementa aquí la lógica usando JPA o ignora si solo es archivo.
        } catch (IOException e) {
            throw e;
        }
    }
}