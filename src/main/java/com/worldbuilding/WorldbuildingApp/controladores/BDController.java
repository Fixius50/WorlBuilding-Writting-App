package com.worldbuilding.WorldbuildingApp.controladores;

import jakarta.servlet.http.HttpSession;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardOpenOption;

/**
 * Esta clase se encarga de realizar las operaciones lógicas de la base de datos del proyecto actual.
 * En lugar de insertar directamente en la DB, escribe llamadas a funciones SQL en el archivo .sql del proyecto activo.
 */
@RestController
@RequestMapping("/api/bd")
public class BDController {

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
            @RequestParam int tabla,
            @RequestParam String datos,
            HttpSession session) {

        String proyectoActivo = (String) session.getAttribute("proyectoActivo");

        if (proyectoActivo == null) {
            return ResponseEntity.status(400).body("No hay proyecto activo en sesión");
        }

        Path archivoSQL = Paths.get(DATA_FOLDER, proyectoActivo, proyectoActivo + ".sql");

        if (!Files.exists(archivoSQL)) {
            return ResponseEntity.status(404).body("Archivo SQL del proyecto activo no encontrado");
        }

        String llamadaFuncionSQL = llamadaFuncion(tabla, datos);

        if (llamadaFuncionSQL == null) {
            return ResponseEntity.badRequest().body("Número de tabla inválido");
        }

        try {
            // Agrega la llamada al final del archivo con un salto de línea, sin borrar lo que ya estaba
            Files.writeString(archivoSQL, llamadaFuncionSQL + "\n", StandardOpenOption.APPEND);
            return ResponseEntity.ok("Datos insertados correctamente en el archivo SQL");
        } catch (IOException e) {
            return ResponseEntity.status(500).body("Error escribiendo en el archivo SQL");
        }
    }

    /**
     * Construye la llamada a la función SQL según el número de tabla y los datos recibidos.
     * El formato depende de cómo tengas definidas las funciones SQL en el archivo.
     * Ejemplo: "CALL crearEntidadIndividual('dato1','dato2','dato3');"
     */
    private String llamadaFuncion(int tabla, String datos) {
        String[] valores = datos.split(","); // asumo que datos están separados por coma

        switch (tabla) {
            case 0:
                return construirLlamada("crearEntidadIndividual", valores);
            case 1:
                return construirLlamada("crearEntidadColectiva", valores);
            case 2:
                return construirLlamada("crearEfectos", valores);
            case 3:
                return construirLlamada("crearConstruccion", valores);
            case 4:
                return construirLlamada("crearZona", valores);
            case 5:
                return construirLlamada("crearInteraccion", valores);
            default:
                return null;
        }
    }

    /**
     * Construye el string con la llamada a la función SQL con los parámetros entre comillas simples y separados por coma.
     * Ejemplo de resultado: "CALL crearEntidadIndividual('valor1','valor2','valor3');"
     */
    private String construirLlamada(String nombreFuncion, String[] valores) {
        StringBuilder sb = new StringBuilder();
        sb.append("CALL ").append(nombreFuncion).append("(");

        for (int i = 0; i < valores.length; i++) {
            sb.append("'").append(valores[i].trim().replace("'", "''")).append("'");
            if (i < valores.length - 1) {
                sb.append(", ");
            }
        }

        sb.append(");");
        return sb.toString();
    }
}