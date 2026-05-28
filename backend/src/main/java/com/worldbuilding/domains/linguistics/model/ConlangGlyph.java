package com.worldbuilding.domains.linguistics.model;

public class ConlangGlyph {
    private String charRepresented;
    private String unicodePoint;
    private String svgPath;
    private int width;
    private int height;

    public ConlangGlyph() {
    }

    public ConlangGlyph(String charRepresented, String unicodePoint, String svgPath, int width, int height) {
        this.charRepresented = charRepresented;
        this.unicodePoint = unicodePoint;
        this.svgPath = svgPath;
        this.width = width;
        this.height = height;
    }

    public String getCharRepresented() {
        return charRepresented;
    }

    public void setCharRepresented(String charRepresented) {
        this.charRepresented = charRepresented;
    }

    public String getUnicodePoint() {
        return unicodePoint;
    }

    public void setUnicodePoint(String unicodePoint) {
        this.unicodePoint = unicodePoint;
    }

    public String getSvgPath() {
        return svgPath;
    }

    public void setSvgPath(String svgPath) {
        this.svgPath = svgPath;
    }

    public int getWidth() {
        return width;
    }

    public void setWidth(int width) {
        this.width = width;
    }

    public int getHeight() {
        return height;
    }

    public void setHeight(int height) {
        this.height = height;
    }
}
