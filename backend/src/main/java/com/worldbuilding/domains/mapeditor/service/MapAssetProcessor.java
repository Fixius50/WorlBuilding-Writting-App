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

    /**
     * Descarga una imagen desde una URL externa, la guarda en el disco del servidor y devuelve sus metadatos.
     */
    public MapAsset saveMapImageFromUrl(String projectName, String mapName, String imageUrl) throws IOException {
        String cleanMapName = mapName.toLowerCase().replaceAll("[^a-z0-9]", "_");
        String extension = "png";

        String cleanUrl = imageUrl.toLowerCase().split("\\?")[0];
        if (cleanUrl.endsWith(".jpg") || cleanUrl.endsWith(".jpeg")) {
            extension = "jpg";
        } else if (cleanUrl.endsWith(".webp")) {
            extension = "webp";
        } else if (cleanUrl.endsWith(".svg")) {
            extension = "svg";
        } else if (cleanUrl.endsWith(".gif")) {
            extension = "gif";
        }

        String fileName = cleanMapName + "_url." + extension;
        Path targetPath = Paths.get(MAPS_DIR).resolve(projectName + "_" + fileName);

        java.net.URL url = new java.net.URL(imageUrl);
        try (java.io.InputStream in = url.openStream()) {
            Files.copy(in, targetPath, java.nio.file.StandardCopyOption.REPLACE_EXISTING);
        }

        String resolution = "unknown";
        try {
            java.awt.image.BufferedImage bufferedImage = javax.imageio.ImageIO.read(targetPath.toFile());
            resolution = bufferedImage != null
                ? bufferedImage.getWidth() + "x" + bufferedImage.getHeight()
                : "unknown";
        } catch (Exception e) {
            // Ignorar fallos de lectura de resolución para tipos de imagen específicos
        }

        MapAsset asset = new MapAsset();
        asset.setId(System.currentTimeMillis());
        asset.setName(mapName);
        asset.setSlug(cleanMapName);
        asset.setFileName(fileName);
        asset.setFilePath(targetPath.toAbsolutePath().toString());
        asset.setSizeBytes(Files.size(targetPath));
        asset.setResolution(resolution);
        asset.setLayerCount(1);

        return asset;
    }

    /**
     * Genera una imagen en blanco de 2048x2048 en el disco del servidor para actuar como un lienzo base vacío e ilimitado.
     */
    public MapAsset createBlankCanvas(String projectName, String mapName) throws IOException {
        String cleanMapName = mapName.toLowerCase().replaceAll("[^a-z0-9]", "_");
        String fileName = cleanMapName + "_blank.png";
        Path targetPath = Paths.get(MAPS_DIR).resolve(projectName + "_" + fileName);

        int width = 2048;
        int height = 2048;
        java.awt.image.BufferedImage img = new java.awt.image.BufferedImage(width, height, java.awt.image.BufferedImage.TYPE_INT_ARGB);
        java.awt.Graphics2D g2d = img.createGraphics();
        g2d.setColor(java.awt.Color.WHITE);
        g2d.fillRect(0, 0, width, height);
        g2d.dispose();

        javax.imageio.ImageIO.write(img, "png", targetPath.toFile());

        MapAsset asset = new MapAsset();
        asset.setId(System.currentTimeMillis());
        asset.setName(mapName);
        asset.setSlug(cleanMapName);
        asset.setFileName(fileName);
        asset.setFilePath(targetPath.toAbsolutePath().toString());
        asset.setSizeBytes(Files.size(targetPath));
        asset.setResolution(width + "x" + height);
        asset.setLayerCount(1);

        return asset;
    }
}
