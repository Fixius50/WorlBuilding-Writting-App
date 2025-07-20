package com.worldbuilding.WorldbuildingApp.modelos;

import com.worldbuilding.WorldbuildingApp.ParametrosBaseDatos;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

@Entity
public class Construccion extends ParametrosBaseDatos {

    @Id @Column(name = "tamanno") @GeneratedValue(strategy = GenerationType.IDENTITY)
    private String tamanno;
    @Id @Column(name = "desarrollo") @GeneratedValue(strategy = GenerationType.IDENTITY)
    private String desarrollo;

    // Constructor
    public Construccion(Long id, String nombre, String apellidos, String tamanno, String tipo, String desarrollo, String descripcion) {
        super(id, nombre, apellidos, tipo, descripcion);
        this.tamanno = tamanno;
        this.desarrollo = desarrollo;
    }

}