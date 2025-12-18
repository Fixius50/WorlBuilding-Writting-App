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

    private LocalDateTime fechaCreacion = LocalDateTime.now();

    public Long getId() {
        return id;
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

    public LocalDateTime getFechaCreacion() {
        return fechaCreacion;
    }

    public void setFechaCreacion(LocalDateTime fechaCreacion) {
        this.fechaCreacion = fechaCreacion;
    }
}
