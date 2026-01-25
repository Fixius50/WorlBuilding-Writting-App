package com.worldbuilding.app.model;

import jakarta.persistence.*;
import java.util.List;

@Entity
@Table(name = "universo")
public class Universo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nombre;

    @Column
    private String descripcion;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "proyecto_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private Cuaderno cuaderno;

    @OneToMany(mappedBy = "universo", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<LineaTiempo> lineasTemporales;

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

    public Cuaderno getCuaderno() {
        return cuaderno;
    }

    public void setCuaderno(Cuaderno cuaderno) {
        this.cuaderno = cuaderno;
    }

    public List<LineaTiempo> getLineasTemporales() {
        return lineasTemporales;
    }

    public void setLineasTemporales(List<LineaTiempo> lineasTemporales) {
        this.lineasTemporales = lineasTemporales;
    }
}
