package com.worldbuilding.app.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "carpeta")
@org.hibernate.annotations.SQLDelete(sql = "UPDATE carpeta SET deleted = 1, deleted_date = CURRENT_TIMESTAMP WHERE id = ?")
@org.hibernate.annotations.Where(clause = "deleted = false")
public class Carpeta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nombre;

    @com.fasterxml.jackson.annotation.JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "proyecto_id", nullable = false)
    private Cuaderno proyecto;

    @com.fasterxml.jackson.annotation.JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "padre_id")
    private Carpeta padre; // Restore Entity mapping

    @Column(name = "tipo")
    private String tipo; // UNIVERSE, GALAXY, ...

    @Column(name = "descripcion")
    private String descripcion;
    private String slug;

    @com.fasterxml.jackson.annotation.JsonIgnore
    @OneToMany(mappedBy = "padre", cascade = CascadeType.ALL)
    private List<Carpeta> subcarpetas;

    @com.fasterxml.jackson.annotation.JsonIgnore
    @OneToMany(mappedBy = "carpeta", cascade = CascadeType.ALL)
    private List<AtributoPlantilla> plantillas;

    @com.fasterxml.jackson.annotation.JsonIgnore
    @OneToMany(mappedBy = "carpeta", cascade = CascadeType.ALL)
    private List<EntidadGenerica> entidades;

    @Column(columnDefinition = "BOOLEAN DEFAULT false")
    private boolean deleted = false;

    @Column(name = "deleted_date")
    private LocalDateTime deletedDate;

    // Use Transient to avoid formula errors for now. Populated by service.
    @Transient
    private int itemCount = 0;

    public int getItemCount() {
        return itemCount;
    }

    public void setItemCount(int itemCount) {
        this.itemCount = itemCount;
    }

    // Getters y Setters
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

    @com.fasterxml.jackson.annotation.JsonIgnore
    public Cuaderno getProyecto() {
        return proyecto;
    }

    public void setProyecto(Cuaderno proyecto) {
        this.proyecto = proyecto;
    }

    @com.fasterxml.jackson.annotation.JsonIgnore
    public Carpeta getPadre() {
        return padre;
    }

    public void setPadre(Carpeta padre) {
        this.padre = padre;
    }

    public Long getPadreId() {
        return padre != null ? padre.getId() : null;
    }

    public String getTipo() {
        return tipo;
    }

    public void setTipo(String tipo) {
        this.tipo = tipo;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }

    public String getSlug() {
        return slug;
    }

    public void setSlug(String slug) {
        this.slug = slug;
    }

    public List<Carpeta> getSubcarpetas() {
        return subcarpetas;
    }

    public void setSubcarpetas(List<Carpeta> subcarpetas) {
        this.subcarpetas = subcarpetas;
    }

    public List<AtributoPlantilla> getPlantillas() {
        return plantillas;
    }

    public void setPlantillas(List<AtributoPlantilla> plantillas) {
        this.plantillas = plantillas;
    }

    public List<EntidadGenerica> getEntidades() {
        return entidades;
    }

    public void setEntidades(List<EntidadGenerica> entidades) {
        this.entidades = entidades;
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
