package com.worldbuilding.WorldbuildingApp.servicios;

import org.springframework.stereotype.Service;
import java.io.IOException;
import java.nio.file.*;
import java.time.LocalDateTime;
import java.util.*;
import java.util.regex.*;

@Service
public class ProyectoService {

    /**
     * Obtiene la ruta absoluta de la carpeta de datos.
     * Primero intenta src/main/data (desarrollo/IDE).
     * Si no existe, busca en target/classes (ejecución desde JAR compilado).
     */
    private Path obtenerCarpetaDatos() {
        Path ruta1 = Paths.get(System.getProperty("user.dir"), "src/main/data");
        if (Files.exists(ruta1) && Files.isDirectory(ruta1)) {
            System.out.println("[ProyectoService] Usando carpeta de datos: " + ruta1.toAbsolutePath());
            return ruta1;
        }
        
        // Fallback: buscar en el mismo directorio del JAR ejecutándose
        Path ruta2 = Paths.get(System.getProperty("user.dir"), "data");
        System.out.println("[ProyectoService] Carpeta src/main/data no encontrada. Intentando: " + ruta2.toAbsolutePath());
        return ruta2;
    }

    public void agregarOperacionAlArchivo(String nombreProyecto, String operacionSQL) throws IOException {
        Path carpetaDatos = obtenerCarpetaDatos();
        Path archivoSQL = carpetaDatos.resolve(nombreProyecto + ".sql");
        
        System.out.println("[ProyectoService.agregarOperacionAlArchivo] Buscando archivo en: " + archivoSQL.toAbsolutePath());
        System.out.println("[ProyectoService.agregarOperacionAlArchivo] Archivo existe: " + Files.exists(archivoSQL));
        
        if (!Files.exists(archivoSQL)) {
            throw new IOException("Archivo del proyecto no encontrado: " + archivoSQL.toAbsolutePath());
        }

        String nuevaOperacion = "\n-- Operación agregada: " + LocalDateTime.now() + "\n";
        nuevaOperacion += operacionSQL + "\n";
        
        if (!Files.isWritable(archivoSQL)) {
            throw new IOException("No hay permisos de escritura en: " + archivoSQL.toAbsolutePath());
        }
        
        System.out.println("[ProyectoService.agregarOperacionAlArchivo] Escribiendo SQL:");
        System.out.println("[ProyectoService.agregarOperacionAlArchivo] Ruta: " + archivoSQL.toAbsolutePath());
        System.out.println("[ProyectoService.agregarOperacionAlArchivo] SQL: " + operacionSQL);
        Files.writeString(archivoSQL, nuevaOperacion, StandardOpenOption.APPEND);
        System.out.println("[ProyectoService.agregarOperacionAlArchivo] ¡Escritura completada exitosamente!");
    }

    public String leerArchivoSQL(String nombreProyecto) throws IOException {
        Path carpetaDatos = obtenerCarpetaDatos();
        Path archivoSQL = carpetaDatos.resolve(nombreProyecto + ".sql");
        if (!Files.exists(archivoSQL)) {
            throw new IOException("Archivo del proyecto no encontrado: " + archivoSQL.toAbsolutePath());
        }
        return Files.readString(archivoSQL);
    }

    public void escribirArchivoSQL(String nombreProyecto, String contenido) throws IOException {
        Path carpetaDatos = obtenerCarpetaDatos();
        Path archivoSQL = carpetaDatos.resolve(nombreProyecto + ".sql");
        System.out.println("[ProyectoService.escribirArchivoSQL] Escribiendo en: " + archivoSQL.toAbsolutePath());
        Files.writeString(archivoSQL, contenido, StandardOpenOption.CREATE, StandardOpenOption.WRITE);
        System.out.println("[ProyectoService.escribirArchivoSQL] Completado");
    }

    /**
     * Método auxiliar para extraer datos de una tabla específica del contenido SQL
     * @param contenidoSQL El contenido del archivo SQL
     * @param nombreTabla El nombre de la tabla a extraer
     * @return Lista de mapas con los datos de la tabla
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
        
        if (valorActual.length() > 0) {
            valores.add(valorActual.toString().trim());
        }
        
        return valores.toArray(new String[0]);
    }
}
