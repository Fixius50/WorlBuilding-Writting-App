package com.worldbuilding.app.dto;

public class ProjectMetadataDTO {
    private String filename;
    private String title;
    private String genre;
    private String imageUrl;
    private String lastModified;
    private String initials;
    private String tag; // Same as genre mostly, but UI uses tag

    // Constructors
    public ProjectMetadataDTO() {
    }

    public ProjectMetadataDTO(String filename, String title, String genre, String imageUrl, String lastModified) {
        this.filename = filename;
        this.title = title != null && !title.isEmpty() ? title : filename;
        this.genre = genre != null ? genre : "General";
        this.imageUrl = imageUrl;
        this.lastModified = lastModified != null ? lastModified : "Unknown";
        this.tag = this.genre.toUpperCase();

        // Calculate initials
        if (this.title != null && this.title.length() >= 2) {
            this.initials = this.title.substring(0, 2).toUpperCase();
        } else {
            this.initials = "??";
        }
    }

    // Getters and Setters
    public String getFilename() {
        return filename;
    }

    public void setFilename(String filename) {
        this.filename = filename;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getGenre() {
        return genre;
    }

    public void setGenre(String genre) {
        this.genre = genre;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public String getLastModified() {
        return lastModified;
    }

    public void setLastModified(String lastModified) {
        this.lastModified = lastModified;
    }

    public String getInitials() {
        return initials;
    }

    public void setInitials(String initials) {
        this.initials = initials;
    }

    public String getTag() {
        return tag;
    }

    public void setTag(String tag) {
        this.tag = tag;
    }
}
