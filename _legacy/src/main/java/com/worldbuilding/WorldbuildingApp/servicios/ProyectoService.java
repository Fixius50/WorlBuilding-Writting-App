package com.worldbuilding.WorldbuildingApp.servicios;

import org.springframework.stereotype.Service;
import java.io.IOException;
import java.nio.file.*;
import java.time.LocalDateTime;

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

    public void escribirArchivoSQL(String nombreProyecto, String contenido) throws IOException {
        Path carpetaDatos = obtenerCarpetaDatos();
        Path archivoSQL = carpetaDatos.resolve(nombreProyecto + ".sql");
        System.out.println("[ProyectoService.escribirArchivoSQL] Escribiendo en: " + archivoSQL.toAbsolutePath());
        Files.writeString(archivoSQL, contenido, StandardOpenOption.CREATE, StandardOpenOption.WRITE);
        System.out.println("[ProyectoService.escribirArchivoSQL] Completado");
    }
}