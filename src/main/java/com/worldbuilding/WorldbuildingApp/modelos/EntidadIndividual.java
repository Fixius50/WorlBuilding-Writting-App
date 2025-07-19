package com.worldbuilding.WorldbuildingApp.modelos;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

@Entity
public class EntidadIndividual extends ParametrosBaseDatos{

    @Id @Column(name = "estado") @GeneratedValue(strategy = GenerationType.IDENTITY)
    private String estado;
    @Id @Column(name = "origen") @GeneratedValue(strategy = GenerationType.IDENTITY)
    private String origen;
    @Id @Column(name = "comportamiento") @GeneratedValue(strategy = GenerationType.IDENTITY)
    private String comportamiento;

    // Constructor
    public EntidadIndividual(Long id, String nombre, String apellidos, String estado, String tipo, String origen, String comportamiento, String descripcion) {
        super(id, nombre, apellidos, tipo, descripcion);
        this.estado = estado;
        this.origen = origen;
        this.comportamiento = comportamiento;
    }

}