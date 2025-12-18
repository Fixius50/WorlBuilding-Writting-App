package com.worldbuilding.app.model;

import jakarta.persistence.*;

@Entity
@Table(name = "efectos")
public class Efectos {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "nombre_proyecto")
    private String nombreProyecto;

    private String nombre;

    @Column(name = "tipo_efecto")
    private String tipoEfecto;

    private String origen;
    private String alcance;

    @Column(columnDefinition = "CLOB")
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

    public String getTipoEfecto() {
        return tipoEfecto;
    }

    public void setTipoEfecto(String tipoEfecto) {
        this.tipoEfecto = tipoEfecto;
    }

    public String getOrigen() {
        return origen;
    }

    public void setOrigen(String origen) {
        this.origen = origen;
    }

    public String getAlcance() {
        return alcance;
    }

    public void setAlcance(String alcance) {
        this.alcance = alcance;
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
