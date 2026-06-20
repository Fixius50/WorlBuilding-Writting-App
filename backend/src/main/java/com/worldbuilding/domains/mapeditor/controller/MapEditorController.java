package com.worldbuilding.domains.mapeditor.controller;

import com.worldbuilding.domains.mapeditor.model.MapAsset;
import com.worldbuilding.domains.mapeditor.service.MapAssetProcessor;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Path;
import java.nio.file.Paths;

@RestController
@RequestMapping("/mapeditor")
@CrossOrigin(origins = "*")
public class MapEditorController {

    private final MapAssetProcessor assetProcessor;

    public MapEditorController(MapAssetProcessor assetProcessor) {
        this.assetProcessor = assetProcessor;
    }

    @PostMapping("/assets/{projectName}/upload")
    public ResponseEntity<MapAsset> uploadMapAsset(
            @PathVariable String projectName,
            @RequestParam("name") String mapName,
            @RequestParam("file") MultipartFile file) {
        
        ResponseEntity<MapAsset> response;
        boolean isFileEmpty = file.isEmpty();
        if (isFileEmpty) {
            response = ResponseEntity.badRequest().build();
        } else {
            try {
                MapAsset processedAsset = assetProcessor.saveMapImage(projectName, mapName, file);
                response = ResponseEntity.ok(processedAsset);
            } catch (IOException e) {
                response = ResponseEntity.internalServerError().build();
            }
        }
        return response;
    }

    @GetMapping("/assets/{projectName}/download/{fileName}")
    public ResponseEntity<Resource> downloadMapAsset(
            @PathVariable String projectName,
            @PathVariable String fileName) {
        ResponseEntity<Resource> response;
        try {
            Path filePath = Paths.get("maps_assets").resolve(projectName + "_" + fileName).normalize();
            Resource resource = new UrlResource(filePath.toUri());

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

        } catch (MalformedURLException e) {
            response = ResponseEntity.badRequest().build();
        }
        return response;
    }

    @PostMapping("/assets/{projectName}/upload-url")
    public ResponseEntity<MapAsset> uploadMapAssetFromUrl(
            @PathVariable String projectName,
            @RequestParam("name") String mapName,
            @RequestParam("url") String imageUrl) {
        
        ResponseEntity<MapAsset> response;
        boolean isUrlEmpty = imageUrl == null || imageUrl.trim().isEmpty();
        if (isUrlEmpty) {
            response = ResponseEntity.badRequest().build();
        } else {
            try {
                MapAsset processedAsset = assetProcessor.saveMapImageFromUrl(projectName, mapName, imageUrl);
                response = ResponseEntity.ok(processedAsset);
            } catch (IOException e) {
                response = ResponseEntity.internalServerError().build();
            }
        }
        return response;
    }

    @PostMapping("/assets/{projectName}/blank")
    public ResponseEntity<MapAsset> createBlankMap(
            @PathVariable String projectName,
            @RequestParam("name") String mapName) {
        
        ResponseEntity<MapAsset> response;
        try {
            MapAsset processedAsset = assetProcessor.createBlankCanvas(projectName, mapName);
            response = ResponseEntity.ok(processedAsset);
        } catch (IOException e) {
            response = ResponseEntity.internalServerError().build();
        }
        return response;
    }
}
