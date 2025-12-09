package com.worldbuilding.app.model;

import jakarta.persistence.*;

@Entity
@Table(name = "construccion")
public class Construccion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "nombre_proyecto")
    private String nombreProyecto;

    private String nombre;

    @Column(name = "tipo_edificio")
    private String tipoEdificio;

    private String desarrollo;

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

    public String getTipoEdificio() {
        return tipoEdificio;
    }

    public void setTipoEdificio(String tipoEdificio) {
        this.tipoEdificio = tipoEdificio;
    }

    public String getDesarrollo() {
        return desarrollo;
    }

    public void setDesarrollo(String desarrollo) {
        this.desarrollo = desarrollo;
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
