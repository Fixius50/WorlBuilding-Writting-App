package com.worldbuilding.app.model;

import jakarta.persistence.*;

@Entity
@Table(name = "entidad_colectiva")
public class EntidadColectiva {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "nombre_proyecto")
    private String nombreProyecto;

    private String nombre;

    @Column(name = "cantidad_miembros")
    private Integer cantidadMiembros;

    private String tipo;
    private String comportamiento;

    @Column(columnDefinition = "MEDIUMTEXT")
    private String descripcion;

    @Column(name = "es_nodo")
    private boolean esNodo = false;

    // Getters y Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNombreProyecto() {
        return nombreProyecto;
    }

    public void setNombreProyecto(String nombreProyecto) {
        this.nombreProyecto = nombreProyecto;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public Integer getCantidadMiembros() {
        return cantidadMiembros;
    }

    public void setCantidadMiembros(Integer cantidadMiembros) {
        this.cantidadMiembros = cantidadMiembros;
    }

    public String getTipo() {
        return tipo;
    }

    public void setTipo(String tipo) {
        this.tipo = tipo;
    }

    public String getComportamiento() {
        return comportamiento;
    }

    public void setComportamiento(String comportamiento) {
        this.comportamiento = comportamiento;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }

    public boolean isEsNodo() {
        return esNodo;
    }

    public void setEsNodo(boolean esNodo) {
        this.esNodo = esNodo;
    }
}
