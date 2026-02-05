package com.worldbuilding.app.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "conlang")
public class Conlang {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nombre;

    @Column(columnDefinition = "CLOB")
    private String descripcion;

    @Column(columnDefinition = "CLOB")
    private String fonologia;

    @Column(columnDefinition = "CLOB")
    private String gramatica;

    @Column(name = "font_family_name")
    private String fontFamilyName;

    @Column(name = "nombre_proyecto")
    private String nombreProyecto;

    @Column(name = "font_binary")
    private byte[] fontBinary;

    private LocalDateTime fechaCreacion = LocalDateTime.now();

    public byte[] getFontBinary() {
        return fontBinary;
    }

    public void setFontBinary(byte[] fontBinary) {
        this.fontBinary = fontBinary;
    }

    public Long getId() {
        return id;
    }

    public String getNombreProyecto() {
        return nombreProyecto;
    }

    public void setNombreProyecto(String nombreProyecto) {
        this.nombreProyecto = nombreProyecto;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }

    public String getFonologia() {
        return fonologia;
    }

    public void setFonologia(String fonologia) {
        this.fonologia = fonologia;
    }

    public String getGramatica() {
        return gramatica;
    }

    public void setGramatica(String gramatica) {
        this.gramatica = gramatica;
    }

    public String getFontFamilyName() {
        return fontFamilyName;
    }

    public void setFontFamilyName(String fontFamilyName) {
        this.fontFamilyName = fontFamilyName;
    }

    public LocalDateTime getFechaCreacion() {
        return fechaCreacion;
    }

    public void setFechaCreacion(LocalDateTime fechaCreacion) {
        this.fechaCreacion = fechaCreacion;
    }
}
