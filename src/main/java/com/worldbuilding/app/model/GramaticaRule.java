package com.worldbuilding.app.model;

import jakarta.persistence.*;

@Entity
@Table(name = "gramatica_rule")
public class GramaticaRule {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String titulo;

    @Column(columnDefinition = "CLOB")
    private String descripcion;

    private String categoria; // e.g., "Syntax", "Morphology", "Phonology"

    @Column(name = "conlang_id")
    private Long conlangId;

    private String status; // e.g., "Complete", "In Progress", "Draft"

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitulo() {
        return titulo;
    }

    public void setTitulo(String titulo) {
        this.titulo = titulo;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }

    public String getCategoria() {
        return categoria;
    }

    public void setCategoria(String categoria) {
        this.categoria = categoria;
    }

    public Long getConlangId() {
        return conlangId;
    }

    public void setConlangId(Long conlangId) {
        this.conlangId = conlangId;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
