package com.worldbuilding.WorldbuildingApp.modelos;

import com.worldbuilding.WorldbuildingApp.ParametrosBaseDatos;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

@Entity
public class Efectos extends ParametrosBaseDatos{
    @Id @Column(name = "origen") @GeneratedValue(strategy = GenerationType.IDENTITY)
    private String origen;
    @Id @Column(name = "dureza") @GeneratedValue(strategy = GenerationType.IDENTITY)
    private String dureza;
    @Id @Column(name = "dureza") @GeneratedValue(strategy = GenerationType.IDENTITY)
    private String comportamiento;

    // Constructor
    public Efectos(Long id, String nombre, String apellidos, String origen, String tipo, String comportamiento, String desarrollo, String descripcion) {
        super(id, nombre, apellidos, tipo, descripcion);
        this.origen = origen;
        this.tipo = dureza;
        this.comportamiento = comportamiento;
    }
}