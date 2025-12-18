package com.worldbuilding.app.model;

import jakarta.persistence.*;

@Entity
@Table(name = "relacion")
public class Relacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "nodo_origen_id")
    private Long nodoOrigenId;

    @Column(name = "nodo_destino_id")
    private Long nodoDestinoId;

    @Column(name = "tipo_relacion")
    private String tipoRelacion;

    // Getters y Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getNodoOrigenId() {
        return nodoOrigenId;
    }

    public void setNodoOrigenId(Long nodoOrigenId) {
        this.nodoOrigenId = nodoOrigenId;
    }

    public Long getNodoDestinoId() {
        return nodoDestinoId;
    }

    public void setNodoDestinoId(Long nodoDestinoId) {
        this.nodoDestinoId = nodoDestinoId;
    }

    public String getTipoRelacion() {
        return tipoRelacion;
    }

    public void setTipoRelacion(String tipoRelacion) {
        this.tipoRelacion = tipoRelacion;
    }
}
