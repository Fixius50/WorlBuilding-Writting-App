package com.worldbuilding.app.model;

import jakarta.persistence.*;

@Entity
@Table(name = "nodo")
public class Nodo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "entidad_id")
    private Long entidadId;

    @Column(name = "tipo_entidad")
    private String tipoEntidad;

    @Column(name = "caracteristica_relacional")
    private String caracteristicaRelacional;

    @Column(name = "pos_x")
    private Double posX;

    @Column(name = "pos_y")
    private Double posY;

    // Getters y Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getEntidadId() {
        return entidadId;
    }

    public void setEntidadId(Long entidadId) {
        this.entidadId = entidadId;
    }

    public String getTipoEntidad() {
        return tipoEntidad;
    }

    public void setTipoEntidad(String tipoEntidad) {
        this.tipoEntidad = tipoEntidad;
    }

    public String getCaracteristicaRelacional() {
        return caracteristicaRelacional;
    }

    public void setCaracteristicaRelacional(String caracteristicaRelacional) {
        this.caracteristicaRelacional = caracteristicaRelacional;
    }

    public Double getPosX() {
        return posX;
    }

    public void setPosX(Double posX) {
        this.posX = posX;
    }

    public Double getPosY() {
        return posY;
    }

    public void setPosY(Double posY) {
        this.posY = posY;
    }
}
