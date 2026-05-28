package com.worldbuilding.domains.mapeditor.service;

import com.worldbuilding.domains.mapeditor.model.MapAsset;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@Service
public class MapAssetProcessor {

    private final String MAPS_DIR = "maps_assets";

    public MapAssetProcessor() {
        File dir = new File(MAPS_DIR);
        if (!dir.exists()) {
            dir.mkdirs();
        }
    }

    /**
     * Guarda físicamente la imagen de alta resolución de un mapa en disco y devuelve sus metadatos procesados.
     */
    public MapAsset saveMapImage(String projectName, String mapName, MultipartFile file) throws IOException {
        String cleanMapName = mapName.toLowerCase().replaceAll("[^a-z0-9]", "_");
        String extension = "png";
        
        String originalFilename = file.getOriginalFilename();
        boolean hasOriginal = originalFilename != null && originalFilename.contains(".");
        extension = hasOriginal && originalFilename != null
            ? originalFilename.substring(originalFilename.lastIndexOf(".") + 1)
            : "png";

        String fileName = cleanMapName + "." + extension;
        Path targetPath = Paths.get(MAPS_DIR).resolve(projectName + "_" + fileName);

        Files.copy(file.getInputStream(), targetPath, java.nio.file.StandardCopyOption.REPLACE_EXISTING);

        String resolution = "unknown";
        try {
            java.awt.image.BufferedImage bufferedImage = javax.imageio.ImageIO.read(targetPath.toFile());
            resolution = bufferedImage != null
                ? bufferedImage.getWidth() + "x" + bufferedImage.getHeight()
                : "unknown";
        } catch (Exception e) {
            // [LOG REMOVED]
        }

        MapAsset asset = new MapAsset();
        asset.setId(System.currentTimeMillis());
        asset.setName(mapName);
        asset.setSlug(cleanMapName);
        asset.setFileName(fileName);
        asset.setFilePath(targetPath.toAbsolutePath().toString());
        asset.setSizeBytes(file.getSize());
        asset.setResolution(resolution);
        asset.setLayerCount(1);

        return asset;
    }
}
