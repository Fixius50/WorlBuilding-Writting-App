package com.worldbuilding.app.model;

import jakarta.persistence.*;

@Entity
@Table(name = "evento_tiempo")
public class EventoTiempo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nombre;

    @Column(length = 2000)
    private String descripcion;

    @Column(name = "fecha_texto")
    private String fechaTexto; // "Year 300", "3rd Age", etc.

    @Column(name = "orden_absoluto")
    private Long ordenAbsoluto; // For sorting if text date is ambiguous

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "linea_tiempo_id")
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
    private LineaTiempo lineaTiempo;

    // Constructors
    public EventoTiempo() {
    }

    public EventoTiempo(String nombre, String descripcion, String fechaTexto, LineaTiempo lineaTiempo) {
        this.nombre = nombre;
        this.descripcion = descripcion;
        this.fechaTexto = fechaTexto;
        this.lineaTiempo = lineaTiempo;
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

    public String getFechaTexto() {
        return fechaTexto;
    }

    public void setFechaTexto(String fechaTexto) {
        this.fechaTexto = fechaTexto;
    }

    public Long getOrdenAbsoluto() {
        return ordenAbsoluto;
    }

    public void setOrdenAbsoluto(Long ordenAbsoluto) {
        this.ordenAbsoluto = ordenAbsoluto;
    }

    public LineaTiempo getLineaTiempo() {
        return lineaTiempo;
    }

    public void setLineaTiempo(LineaTiempo lineaTiempo) {
        this.lineaTiempo = lineaTiempo;
    }
}
