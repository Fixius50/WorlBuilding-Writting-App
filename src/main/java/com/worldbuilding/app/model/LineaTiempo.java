package com.worldbuilding.app.model;

import jakarta.persistence.*;

@Entity
@Table(name = "linea_tiempo")
public class LineaTiempo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nombre;

    @Column(length = 1000)
    private String descripcion;

    @Column(name = "es_raiz")
    private Boolean esRaiz = false; // "Global" timeline

    // Constructors
    public LineaTiempo() {
    }

    public LineaTiempo(String nombre, String descripcion, Boolean esRaiz) {
        this.nombre = nombre;
        this.descripcion = descripcion;
        this.esRaiz = esRaiz;
    }

    // Getters and Setters
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

    public Boolean getEsRaiz() {
        return esRaiz;
    }

    public void setEsRaiz(Boolean esRaiz) {
        this.esRaiz = esRaiz;
    }
}
