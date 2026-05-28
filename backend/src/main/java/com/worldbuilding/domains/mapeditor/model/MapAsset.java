package com.worldbuilding.domains.mapeditor.model;

public class MapAsset {
    private Long id;
    private String name;
    private String slug;
    private String fileName;
    private String filePath;
    private long sizeBytes;
    private String resolution;
    private int layerCount;

    public MapAsset() {
    }

    public MapAsset(Long id, String name, String slug, String fileName, String filePath, 
                    long sizeBytes, String resolution, int layerCount) {
        this.id = id;
        this.name = name;
        this.slug = slug;
        this.fileName = fileName;
        this.filePath = filePath;
        this.sizeBytes = sizeBytes;
        this.resolution = resolution;
        this.layerCount = layerCount;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getSlug() {
        return slug;
    }

    public void setSlug(String slug) {
        this.slug = slug;
    }

    public String getFileName() {
        return fileName;
    }

    public void setFileName(String fileName) {
        this.fileName = fileName;
    }

    public String getFilePath() {
        return filePath;
    }

    public void setFilePath(String filePath) {
        this.filePath = filePath;
    }

    public long getSizeBytes() {
        return sizeBytes;
    }

    public void setSizeBytes(long sizeBytes) {
        this.sizeBytes = sizeBytes;
    }

    public String getResolution() {
        return resolution;
    }

    public void setResolution(String resolution) {
        this.resolution = resolution;
    }

    public int getLayerCount() {
        return layerCount;
    }

    public void setLayerCount(int layerCount) {
        this.layerCount = layerCount;
    }
}
