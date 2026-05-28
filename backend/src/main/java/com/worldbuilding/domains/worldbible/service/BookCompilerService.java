package com.worldbuilding.domains.worldbible.service;

import com.worldbuilding.domains.worldbible.model.CompilationSettings;
import com.worldbuilding.domains.worldbible.model.ExportFormat;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Map;

@Service
public class BookCompilerService {

    private final String EXPORTS_DIR = "exports";

    public BookCompilerService() {
        File dir = new File(EXPORTS_DIR);
        if (!dir.exists()) {
            dir.mkdirs();
        }
    }

    /**
     * Compila la estructura del libro (artículos y sus contenidos) en un documento físico en disco.
     */
    public Path compileBook(String projectName, ExportFormat format, CompilationSettings settings, Map<String, Object> contentTree) throws IOException {
        String fileExtension = format.toString().toLowerCase();
        String fileName = projectName + "_manuscript." + fileExtension;
        Path targetPath = Paths.get(EXPORTS_DIR).resolve(fileName);

        // Simulamos la exportación construyendo un esqueleto básico de texto
        StringBuilder rawBook = new StringBuilder();
        rawBook.append("=========================================\n");
        rawBook.append("TITLE: ").append(settings.getTitle() != null ? settings.getTitle() : projectName).append("\n");
        rawBook.append("AUTHOR: ").append(settings.getAuthor() != null ? settings.getAuthor() : "Anonymous").append("\n");
        rawBook.append("GENRE: ").append(settings.getGenre() != null ? settings.getGenre() : "Fantasy").append("\n");
        rawBook.append("FORMAT: ").append(format).append("\n");
        rawBook.append("=========================================\n\n");
        
        rawBook.append("--- CONTENIDOS DEL PROYECTO ---\n");
        boolean hasContent = contentTree != null && !contentTree.isEmpty();
        if (hasContent && contentTree != null) {
            contentTree.forEach((key, val) -> rawBook.append("[").append(key).append("]: ").append(val).append("\n"));
        } else {
            rawBook.append("(El manuscrito no contiene artículos aún)\n");
        }

        Files.writeString(targetPath, rawBook.toString());
        return targetPath;
    }
}
