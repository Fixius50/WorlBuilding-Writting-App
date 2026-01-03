package com.worldbuilding.app.model;

import jakarta.persistence.*;

@Entity
@Table(name = "atributo_valor")
public class AtributoValor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @com.fasterxml.jackson.annotation.JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "entidad_id", nullable = false)
    private EntidadGenerica entidad;

    @com.fasterxml.jackson.annotation.JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "plantilla_id", nullable = false)
    private AtributoPlantilla plantilla;

    @Column(columnDefinition = "CLOB")
    private String valor; // JSON string for complex types or simple strings

    // Getters y Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    @com.fasterxml.jackson.annotation.JsonIgnore
    public EntidadGenerica getEntidad() {
        return entidad;
    }

    public void setEntidad(EntidadGenerica entidad) {
        this.entidad = entidad;
    }

    @com.fasterxml.jackson.annotation.JsonIgnore
    public AtributoPlantilla getPlantilla() {
        return plantilla;
    }

    public void setPlantilla(AtributoPlantilla plantilla) {
        this.plantilla = plantilla;
    }

    public String getValor() {
        return valor;
    }

    public void setValor(String valor) {
        this.valor = valor;
    }
}
