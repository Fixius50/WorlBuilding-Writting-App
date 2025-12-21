package com.worldbuilding.app.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "conlang_lexemes")
public class Lexeme {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String gloss; // English/Spanish literal meaning (e.g., "Water")

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private String ipaPronunciation; // Phonetic representation

    @Column(name = "svg_path_data", columnDefinition = "TEXT")
    private String svgPathData; // The vector path for the glyph

    @Column(name = "raster_image_path")
    private String rasterImagePath; // Path to original uploaded image if any

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id")
    private Proyecto project;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getGloss() {
        return gloss;
    }

    public void setGloss(String gloss) {
        this.gloss = gloss;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getIpaPronunciation() {
        return ipaPronunciation;
    }

    public void setIpaPronunciation(String ipaPronunciation) {
        this.ipaPronunciation = ipaPronunciation;
    }

    public String getSvgPathData() {
        return svgPathData;
    }

    public void setSvgPathData(String svgPathData) {
        this.svgPathData = svgPathData;
    }

    public String getRasterImagePath() {
        return rasterImagePath;
    }

    public void setRasterImagePath(String rasterImagePath) {
        this.rasterImagePath = rasterImagePath;
    }

    public Proyecto getProject() {
        return project;
    }

    public void setProject(Proyecto project) {
        this.project = project;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
