package com.worldbuilding.app.model;

import jakarta.persistence.*;

@Entity
@Table(name = "linea_tiempo")
@com.fasterxml.jackson.annotation.JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
@org.hibernate.annotations.SQLRestriction("deleted = 0")
@org.hibernate.annotations.SQLDelete(sql = "UPDATE linea_tiempo SET deleted = 1, deleted_date = CURRENT_TIMESTAMP WHERE id = ?")
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

    @Column(columnDefinition = "boolean default false")
    private Boolean deleted = false;

    @Column(name = "deleted_date")
    private java.time.LocalDateTime deletedDate;

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

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "universo_id")
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties("lineasTemporales")
    private Universo universo;

    public Universo getUniverso() {
        return universo;
    }

    public void setUniverso(Universo universo) {
        this.universo = universo;
    }

    @OneToMany(mappedBy = "lineaTiempo", cascade = CascadeType.ALL, orphanRemoval = true)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private java.util.List<EventoTiempo> eventos;

    public java.util.List<EventoTiempo> getEventos() {
        return eventos;
    }

    public void setEventos(java.util.List<EventoTiempo> eventos) {
        this.eventos = eventos;
    }
}
