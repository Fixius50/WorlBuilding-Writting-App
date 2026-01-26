package com.worldbuilding.WorldbuildingApp.modelos;

import jakarta.persistence.*;

@Entity
@Table(name = "nodo")
public class Nodo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "entidad_id")
    private Integer entidadId;

    @Column(name = "tipo_entidad")
    private String tipoEntidad;

    @Column(name = "caracteristica_relacional")
    private String caracteristicaRelacional;

    // Getters y Setters
    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    public Integer getEntidadId() { return entidadId; }
    public void setEntidadId(Integer entidadId) { this.entidadId = entidadId; }
    public String getTipoEntidad() { return tipoEntidad; }
    public void setTipoEntidad(String tipoEntidad) { this.tipoEntidad = tipoEntidad; }
    public String getCaracteristicaRelacional() { return caracteristicaRelacional; }
    public void setCaracteristicaRelacional(String caracteristicaRelacional) { this.caracteristicaRelacional = caracteristicaRelacional; }
}