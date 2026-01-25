package com.worldbuilding.app.model;

import java.time.LocalDateTime;

import jakarta.persistence.*;

@Entity
@Table(name = "zona")
@org.hibernate.annotations.SQLDelete(sql = "UPDATE zona SET deleted = true, deleted_date = CURRENT_TIMESTAMP WHERE id = ?")
@org.hibernate.annotations.SQLRestriction("deleted = 0")
public class Zona {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "nombre_proyecto")
    private String nombreProyecto;

    private String nombre;
    private String apellidos;
    private String tamanno;
    private String tipo;
    private String desarrollo;

    @Column(columnDefinition = "CLOB")
    private String descripcion;

    @Column(name = "es_nodo")
    private boolean esNodo = false;

    @Column(columnDefinition = "BOOLEAN DEFAULT false")
    private boolean deleted = false;

    @Column(name = "deleted_date")
    private LocalDateTime deletedDate;

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

    public String getApellidos() {
        return apellidos;
    }

    public void setApellidos(String apellidos) {
        this.apellidos = apellidos;
    }

    public String getTamanno() {
        return tamanno;
    }

    public void setTamanno(String tamanno) {
        this.tamanno = tamanno;
    }

    public String getTipo() {
        return tipo;
    }

    public void setTipo(String tipo) {
        this.tipo = tipo;
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

    public boolean isDeleted() {
        return deleted;
    }

    public void setDeleted(boolean deleted) {
        this.deleted = deleted;
    }

    public LocalDateTime getDeletedDate() {
        return deletedDate;
    }

    public void setDeletedDate(LocalDateTime deletedDate) {
        this.deletedDate = deletedDate;
    }
}
