package com.worldbuilding.WorldbuildingApp.controladores;

import jakarta.servlet.http.HttpSession;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.worldbuilding.WorldbuildingApp.modelos.*;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardOpenOption;
import java.util.HashMap;
import java.util.Map;

/**
 * Esta clase se encarga de realizar las operaciones lógicas de la base de datos del proyecto actual.
 * En lugar de insertar directamente en la DB, escribe llamadas a funciones SQL en el archivo .sql del proyecto activo.
 */
@RestController
@RequestMapping("/api/bd")
public class BDController{

    private static final Logger logger = LoggerFactory.getLogger(BDController.class);
    // ADVERTENCIA: Esta ruta funcionará en el IDE, pero fallará al empaquetar en un JAR.
    private final String DATA_FOLDER = "src/main/resources/static/data";
    private ResponseEntity<?> status;
    private String proyectoActivo;
    
    public boolean compruebaExistenciaProyecto() {
        Path archivoSQL = Paths.get(DATA_FOLDER, proyectoActivo + ".sql");
        return Files.exists(archivoSQL) && !Files.isDirectory(archivoSQL);
    }

    public static void sobreEscribirSQL(String nombre, String contenido) {
        Path archivoSQL = Paths.get(DATA_FOLDER, nombre + ".sql");
        try {
            Files.writeString(archivoSQL, contenido, StandardOpenOption.APPEND);
        } catch (IOException e) {
            logger.error("Error al sobreescribir el archivo SQL", e);
        }
    }

    /**
     * En este mapa se va a asignar por su proyecto actual los datos de la base de datos.
     * K = Sesión actual o no
     * V = 
     * {
     *      K = tabla
     *      V = valores de esa tabla
     * }
     */
    private Map<HttpSession, HashMap<String, ParametrosBaseDatos>> tablasProyecto = new HashMap<>();

    /**
     * Inserta datos llamando a las funciones SQL dentro del archivo .sql del proyecto activo
     * @param tabla número que identifica la función (0..5)
     * @param datos datos para la función SQL
     * @param session HttpSession para obtener proyecto activo
     * @return ResponseEntity con resultado
     */
    @PutMapping("/insertar")
    public ResponseEntity<?> insertarDatosDB(@RequestBody String[] datos, HttpSession session) throws IOException{
        proyectoActivo = (String) session.getAttribute("proyectoActivo");
        boolean correcto = proyectoActivo != null && datos != null && (datos.length > 6 && datos.length < 9); 
        String tablaReferente = "";
        try {
            if (correcto) {
                for (ParametrosBaseDatos parametros : parametrosDelProyecto.values()) {
                    
                }
            } else{
                throw new IOException("Error en los valores establecidos");
            }
        } catch (IOException e) {
            status = ResponseEntity.status(500).body(e.getMessage());
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
    @DeleteMapping("/borrar")
    public ResponseEntity<?> borrarDatosDB() {

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
    @PatchMapping("/cambiarEstado")
    public ResponseEntity<?> cambiarEstadoNodo() {

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
    public ResponseEntity<?> relacionarElementos() {

        return status;
    }

}