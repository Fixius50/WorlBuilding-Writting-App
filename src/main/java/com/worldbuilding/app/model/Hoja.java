package com.worldbuilding.app.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "hoja")
public class Hoja {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "cuaderno_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private Cuaderno cuaderno;

    @Column(name = "numero_pagina", nullable = false)
    private Integer numeroPagina;

    @Column(columnDefinition = "CLOB")
    private String contenido;

    @Column(name = "fecha_modificacion")
    private LocalDateTime fechaModificacion = LocalDateTime.now();

    @OneToMany(mappedBy = "hoja", cascade = CascadeType.ALL, orphanRemoval = true)
    private java.util.List<NotaRapida> notas = new java.util.ArrayList<>();

    // Getters y Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Cuaderno getCuaderno() {
        return cuaderno;
    }

    public void setCuaderno(Cuaderno cuaderno) {
        this.cuaderno = cuaderno;
    }

    public Integer getNumeroPagina() {
        return numeroPagina;
    }

    public void setNumeroPagina(Integer numeroPagina) {
        this.numeroPagina = numeroPagina;
    }

    public String getContenido() {
        return contenido;
    }

    public void setContenido(String contenido) {
        this.contenido = contenido;
    }

    public LocalDateTime getFechaModificacion() {
        return fechaModificacion;
    }

    public void setFechaModificacion(LocalDateTime fechaModificacion) {
        this.fechaModificacion = fechaModificacion;
    }

    public java.util.List<NotaRapida> getNotas() {
        return notas;
    }

    public void setNotas(java.util.List<NotaRapida> notas) {
        this.notas = notas;
    }
}
