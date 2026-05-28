package com.worldbuilding.domains.worldbible.model;

public class CompilationSettings {
    private String title;
    private String author;
    private String genre;
    private boolean includeCover;
    private String coverImageUrl;
    private String themeColor;
    private String margins;
    private String fontSize;

    public CompilationSettings() {
    }

    public CompilationSettings(String title, String author, String genre, boolean includeCover, 
                               String coverImageUrl, String themeColor, String margins, String fontSize) {
        this.title = title;
        this.author = author;
        this.genre = genre;
        this.includeCover = includeCover;
        this.coverImageUrl = coverImageUrl;
        this.themeColor = themeColor;
        this.margins = margins;
        this.fontSize = fontSize;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getAuthor() {
        return author;
    }

    public void setAuthor(String author) {
        this.author = author;
    }

    public String getGenre() {
        return genre;
    }

    public void setGenre(String genre) {
        this.genre = genre;
    }

    public boolean isIncludeCover() {
        return includeCover;
    }

    public void setIncludeCover(boolean includeCover) {
        this.includeCover = includeCover;
    }

    public String getCoverImageUrl() {
        return coverImageUrl;
    }

    public void setCoverImageUrl(String coverImageUrl) {
        this.coverImageUrl = coverImageUrl;
    }

    public String getThemeColor() {
        return themeColor;
    }

    public void setThemeColor(String themeColor) {
        this.themeColor = themeColor;
    }

    public String getMargins() {
        return margins;
    }

    public void setMargins(String margins) {
        this.margins = margins;
    }

    public String getFontSize() {
        return fontSize;
    }

    public void setFontSize(String fontSize) {
        this.fontSize = fontSize;
    }
}
