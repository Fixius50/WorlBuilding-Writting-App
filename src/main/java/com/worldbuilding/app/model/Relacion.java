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

    @Column(name = "tipo_origen")
    private String tipoOrigen; // ENTITY, MAP, TIMELINE, EVENT

    @Column(name = "tipo_destino")
    private String tipoDestino; // ENTITY, MAP, TIMELINE, EVENT

    @Column(name = "descripcion")
    private String descripcion; // The "Why"

    @Column(name = "metadata")
    private String metadata; // JSON for linked attributes

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

    public String getTipoOrigen() {
        return tipoOrigen;
    }

    public void setTipoOrigen(String tipoOrigen) {
        this.tipoOrigen = tipoOrigen;
    }

    public String getTipoDestino() {
        return tipoDestino;
    }

    public void setTipoDestino(String tipoDestino) {
        this.tipoDestino = tipoDestino;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }

    public String getMetadata() {
        return metadata;
    }

    public void setMetadata(String metadata) {
        this.metadata = metadata;
    }
}
