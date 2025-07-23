package com.worldbuilding.WorldbuildingApp.modelos;

import com.worldbuilding.WorldbuildingApp.ParametrosBaseDatos;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

@Entity
public class Interaccion extends ParametrosBaseDatos{
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(name = "direccion")
    private String direccion;
    @Column(name = "afectados")
    private String afectados;

    // Constructor
    public Interaccion(Long id, String nombre, String apellidos, String direccion, String tipo, String afectados, String descripcion) {
        super(id, nombre, apellidos, tipo, descripcion);
        this.direccion = direccion;
        this.afectados = afectados;
    }
}