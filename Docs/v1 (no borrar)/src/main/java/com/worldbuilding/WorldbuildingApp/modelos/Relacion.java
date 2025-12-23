package com.worldbuilding.WorldbuildingApp.modelos;

import jakarta.persistence.*;

@Entity
@Table(name = "relacion")
public class Relacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "nodo_origen_id")
    private Integer nodoOrigenId;

    @Column(name = "nodo_destino_id")
    private Integer nodoDestinoId;

    @Column(name = "tipo_relacion")
    private String tipoRelacion;

    // Getters y Setters
    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    public Integer getNodoOrigenId() { return nodoOrigenId; }
    public void setNodoOrigenId(Integer nodoOrigenId) { this.nodoOrigenId = nodoOrigenId; }
    public Integer getNodoDestinoId() { return nodoDestinoId; }
    public void setNodoDestinoId(Integer nodoDestinoId) { this.nodoDestinoId = nodoDestinoId; }
    public String getTipoRelacion() { return tipoRelacion; }
    public void setTipoRelacion(String tipoRelacion) { this.tipoRelacion = tipoRelacion; }
}