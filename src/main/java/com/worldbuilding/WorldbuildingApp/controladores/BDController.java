package com.worldbuilding.WorldbuildingApp.controladores;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

// Importamos el REPOSITORY directamente
import com.worldbuilding.interfaces.DatosTablaRepository;

// Ya no necesitamos 'MetodosBaseDatos' ni 'DatosTablaService'
import com.worldbuilding.WorldbuildingApp.modelos.*;

import jakarta.servlet.http.HttpSession;
import java.io.IOException;
import java.nio.file.*;
import java.util.*;
import java.util.regex.*;
import org.springframework.web.bind.annotation.GetMapping;


@RestController
@RequestMapping("/api/bd")
// Ya no implementamos la interfaz 'MetodosBaseDatos'
public class BDController {

    // Inyectamos el REPOSITORY (JPA) directamente
    @Autowired
    private DatosTablaRepository datosTablaRepository;

    @Value("${app.data-folder:./data}")
    private String dataFolder = "src/main/data";

    @PutMapping("/insertar")
    public ResponseEntity<?> insertarDatosDTO(@RequestBody DatosTablaDTO datosDTO, HttpSession session) {
        ResponseEntity<String> mensaje;
        try {
            String nombreProyecto = (String) session.getAttribute("proyectoActivo");
            if (nombreProyecto == null) {
                return ResponseEntity.badRequest().body("No hay proyecto activo");
            }
            String tipoTabla = datosDTO.getTipo();
            
            // Llamamos al REPOSITORY directamente
            DatosTablaDTO guardado = datosTablaRepository.save(datosDTO);
            
            mensaje = ResponseEntity.ok("Datos insertados correctamente en " + tipoTabla + " del proyecto '" + nombreProyecto + "' (ID: " + guardado.getId() + ")");
        } catch (Exception e) {
            mensaje = ResponseEntity.internalServerError().body("Error interno: " + e.getMessage());
        }
        return mensaje;
    }

    @DeleteMapping("/eliminar")
    public ResponseEntity<?> eliminarDatosDTO(@RequestBody DatosTablaDTO datosDTO, HttpSession session) {
        ResponseEntity<String> mensaje;
        try {
            String nombreProyecto = (String) session.getAttribute("proyectoActivo");
            if (nombreProyecto == null) {
                return ResponseEntity.badRequest().body("No hay proyecto activo");
            }
            Long id = datosDTO.getId();
            String tipoTabla = datosDTO.getTipo();

            // Llamamos al REPOSITORY directamente
            datosTablaRepository.deleteById(id);
            
            mensaje = ResponseEntity.ok("Datos eliminados correctamente de " + tipoTabla + " del proyecto '" + nombreProyecto + "'");
        } catch (Exception e) {
            mensaje = ResponseEntity.internalServerError().body("Error al eliminar: " + e.getMessage());
        }
        return mensaje;
    }

    @GetMapping("/obtener")
    public ResponseEntity<?> obtenerDatosDTO(@RequestBody DatosTablaDTO datosDTO, HttpSession session){
        ResponseEntity<String> mensaje;
        try {
            String nombreProyecto = (String) session.getAttribute("proyectoActivo");
            if (nombreProyecto == null) {
                return ResponseEntity.badRequest().body("No hay proyecto activo");
            }
            Long id = datosDTO.getId();

            // Llamamos al REPOSITORY directamente
            Optional<DatosTablaDTO> resultado = datosTablaRepository.findById(id);
            
            if (resultado.isPresent()) {
                mensaje = ResponseEntity.ok(resultado.get().toString()); // Quizás devolver JSON en lugar de toString()
            } else {
                mensaje = ResponseEntity.status(404).body("No se encontró el registro con id " + id);
            }
        } catch (Exception e) {
            mensaje = ResponseEntity.internalServerError().body("Error al obtener datos de: " + e.getMessage());
        }
        return mensaje;
    }

    @PatchMapping("/modificar")
    public ResponseEntity<?> modificarDatosDTO(@RequestBody DatosTablaDTO datosDTO, HttpSession session) {
        ResponseEntity<String> mensaje;
        try {
            String nombreProyecto = (String) session.getAttribute("proyectoActivo");
            if (nombreProyecto == null) {
                return ResponseEntity.badRequest().body("No hay proyecto activo");
            }
            Long id = datosDTO.getId();
            String tipoTabla = datosDTO.getTipo();

            // JPA usa 'save' tanto para crear como para actualizar (si el ID ya existe)
            // Llamamos al REPOSITORY directamente
            datosDTO.setId(id); // Nos aseguramos que el ID esté en el objeto
            DatosTablaDTO actualizado = datosTablaRepository.save(datosDTO);
            
            mensaje = ResponseEntity.ok("Datos modificados correctamente en " + tipoTabla + " del proyecto '" + nombreProyecto + "' (ID: " + actualizado.getId() + ")");
        } catch (Exception e) {
            mensaje = ResponseEntity.internalServerError().body("Error al modificar: " + e.getMessage());
        }
        return mensaje;
    }

    // =================================================================
    // EL RESTO DE MÉTODOS (manejo de archivos, sesión, etc.)
    // SE QUEDAN EXACTAMENTE IGUAL
    // =================================================================

    /**
     * Función para relacionar elementos entre sí
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
     */
    @GetMapping("/verificar")
    public ResponseEntity<?> verificarBaseDeDatos() {
        // Ahora que inyectamos el repositorio, ¡podemos hacer una verificación real!
        try {
            long count = datosTablaRepository.count();
            return ResponseEntity.ok("Conexión a la base de datos exitosa. Hay " + count + " registros en datos_tabla.");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error conectando a la base de datos: " + e.getMessage());
        }
    }


    /**
     * Genera la operación SQL para crear relaciones
     */
    private String generarOperacionRelacionSQL(DatosTablaDTO request) {
        return "-- Operación de relación: " + request.getNombre() + " -> " + request.getDescripcion();
    }

    /**
     * Método auxiliar para extraer datos de una tabla específica del contenido SQL
     */
    public List<Map<String, Object>> extraerDatosDeTabla(String contenidoSQL, String nombreTabla) {
        List<Map<String, Object>> datos = new ArrayList<>();
        String patron = "INSERT\\s+INTO\\s+" + nombreTabla + "\\s*\\(([^)]+)\\)\\s*VALUES\\s*\\(([^)]+)\\);";
        Pattern pattern = Pattern.compile(patron, Pattern.CASE_INSENSITIVE | Pattern.DOTALL);
        Matcher matcher = pattern.matcher(contenidoSQL);
        
        while (matcher.find()) {
            String columnasStr = matcher.group(1);
            String valoresStr = matcher.group(2);
            String[] columnas = columnasStr.split(",");
            for (int i = 0; i < columnas.length; i++) {
                columnas[i] = columnas[i].trim();
            }
            String[] valores = parsearValoresSQL(valoresStr);
            Map<String, Object> fila = new HashMap<>();
            for (int i = 0; i < columnas.length && i < valores.length; i++) {
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
        if (valorActual.length() > 0) {
            valores.add(valorActual.toString().trim());
        }
        return valores.toArray(new String[0]);
    }


    /**
     * Agrega una operación SQL al archivo del proyecto
     */
    private void agregarOperacionAlArchivo(String nombreProyecto, String operacionSQL) throws IOException {
        Path archivoSQL = Paths.get(dataFolder, nombreProyecto + ".sql");
        if (!Files.exists(archivoSQL)) {
            throw new IOException("Archivo del proyecto no encontrado: " + nombreProyecto + ".sql");
        }
        String nuevaOperacion = "\n-- Operación agregada: " + java.time.LocalDateTime.now() + "\n";
        nuevaOperacion += operacionSQL + "\n";
        try {
            if (!Files.isWritable(archivoSQL)) {
                throw new IOException("No hay permisos de escritura en: " + archivoSQL);
            }
            Files.writeString(archivoSQL, nuevaOperacion, StandardOpenOption.APPEND);
        } catch (IOException e) {
            throw e;
        }
    }
}