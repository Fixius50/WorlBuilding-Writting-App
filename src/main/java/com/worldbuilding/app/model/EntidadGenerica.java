package com.worldbuilding.app.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "entidad_generica")
@org.hibernate.annotations.SQLDelete(sql = "UPDATE entidad_generica SET deleted = 1, deleted_date = CURRENT_TIMESTAMP WHERE id = ?")
@org.hibernate.annotations.Where(clause = "deleted = false")
public class EntidadGenerica {

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
    @JoinColumn(name = "carpeta_id", nullable = false)
    private Carpeta carpeta;

    @OneToMany(mappedBy = "entidad", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<AtributoValor> valores;

    @Column(name = "tipo_especial")
    private String tipoEspecial; // null, timeline, map, conlang

    @Column(columnDefinition = "BOOLEAN DEFAULT false")
    private boolean deleted = false;

    @Column(name = "deleted_date")
    private LocalDateTime deletedDate;

    @Column(name = "descripcion", columnDefinition = "TEXT")
    private String descripcion;

    @Column(name = "tags")
    private String tags; // CSV strings

    @Column(name = "slug")
    private String slug;

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
    public Carpeta getCarpeta() {
        return carpeta;
    }

    public void setCarpeta(Carpeta carpeta) {
        this.carpeta = carpeta;
    }

    public List<AtributoValor> getValores() {
        return valores;
    }

    public void setValores(List<AtributoValor> valores) {
        this.valores = valores;
    }

    public String getTipoEspecial() {
        return tipoEspecial;
    }

    public void setTipoEspecial(String tipoEspecial) {
        this.tipoEspecial = tipoEspecial;
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

    public String getDescripcion() {
        return descripcion;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }

    public String getTags() {
        return tags;
    }

    public void setTags(String tags) {
        this.tags = tags;
    }

    public String getSlug() {
        return slug;
    }

    public void setSlug(String slug) {
        this.slug = slug;
    }
}
