package com.worldbuilding.domains.linguistics.model;

public class FontConfig {
    private String fontFamily;
    private String version;
    private String copyright;
    private int unitsPerEm;
    private int ascender;
    private int descender;

    public FontConfig() {
    }

    public FontConfig(String fontFamily, String version, String copyright, int unitsPerEm, int ascender, int descender) {
        this.fontFamily = fontFamily;
        this.version = version;
        this.copyright = copyright;
        this.unitsPerEm = unitsPerEm;
        this.ascender = ascender;
        this.descender = descender;
    }

    public String getFontFamily() {
        return fontFamily;
    }

    public void setFontFamily(String fontFamily) {
        this.fontFamily = fontFamily;
    }

    public String getVersion() {
        return version;
    }

    public void setVersion(String version) {
        this.version = version;
    }

    public String getCopyright() {
        return copyright;
    }

    public void setCopyright(String copyright) {
        this.copyright = copyright;
    }

    public int getUnitsPerEm() {
        return unitsPerEm;
    }

    public void setUnitsPerEm(int unitsPerEm) {
        this.unitsPerEm = unitsPerEm;
    }

    public int getAscender() {
        return ascender;
    }

    public void setAscender(int ascender) {
        this.ascender = ascender;
    }

    public int getDescender() {
        return descender;
    }

    public void setDescender(int descender) {
        this.descender = descender;
    }
}
