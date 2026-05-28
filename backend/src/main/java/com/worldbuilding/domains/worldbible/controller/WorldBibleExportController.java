package com.worldbuilding.domains.worldbible.controller;

import com.worldbuilding.domains.worldbible.model.CompilationSettings;
import com.worldbuilding.domains.worldbible.model.ExportFormat;
import com.worldbuilding.domains.worldbible.service.BookCompilerService;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Path;
import java.util.Map;

@RestController
@RequestMapping("/api/worldbible")
@CrossOrigin(origins = "*")
public class WorldBibleExportController {

    private final BookCompilerService compilerService;

    public WorldBibleExportController(BookCompilerService compilerService) {
        this.compilerService = compilerService;
    }

    @PostMapping("/export/{projectName}")
    public ResponseEntity<Resource> exportProject(
            @PathVariable String projectName,
            @RequestParam("format") ExportFormat format,
            @RequestBody Map<String, Object> payload) {
        
        try {
            // Desestructuramos el cuerpo del JSON para extraer configuraciones y el árbol
            @SuppressWarnings("unchecked")
            Map<String, Object> settingsMap = (Map<String, Object>) payload.get("settings");
            @SuppressWarnings("unchecked")
            Map<String, Object> contentTree = (Map<String, Object>) payload.get("contentTree");

            CompilationSettings settings = new CompilationSettings();
            boolean hasSettings = settingsMap != null;
            if (hasSettings && settingsMap != null) {
                settings.setTitle((String) settingsMap.get("title"));
                settings.setAuthor((String) settingsMap.get("author"));
                settings.setGenre((String) settingsMap.get("genre"));
                settings.setIncludeCover(settingsMap.get("includeCover") != null && (boolean) settingsMap.get("includeCover"));
                settings.setCoverImageUrl((String) settingsMap.get("coverImageUrl"));
                settings.setThemeColor((String) settingsMap.get("themeColor"));
                settings.setMargins((String) settingsMap.get("margins"));
                settings.setFontSize((String) settingsMap.get("fontSize"));
            }

            Path exportedPath = compilerService.compileBook(projectName, format, settings, contentTree);
            Resource resource = new UrlResource(exportedPath.toUri());

            ResponseEntity<Resource> response;
            boolean isResourceValid = resource.exists();
            if (isResourceValid) {
                MediaType mediaType = MediaType.APPLICATION_OCTET_STREAM;
                response = ResponseEntity.ok()
                        .contentType(mediaType)
                        .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + resource.getFilename() + "\"")
                        .body(resource);
            } else {
                response = ResponseEntity.notFound().build();
            }
            return response;

        } catch (MalformedURLException e) {
            return ResponseEntity.badRequest().build();
        } catch (IOException e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}
