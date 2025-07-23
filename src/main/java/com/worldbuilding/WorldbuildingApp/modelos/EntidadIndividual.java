package com.worldbuilding.WorldbuildingApp.modelos;

import com.worldbuilding.WorldbuildingApp.ParametrosBaseDatos;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

@Entity
public class EntidadIndividual extends ParametrosBaseDatos{

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(name = "estado")
    private String estado;
    @Column(name = "origen")
    private String origen;
    @Column(name = "comportamiento")
    private String comportamiento;

    // Constructor
    public EntidadIndividual(Long id, String nombre, String apellidos, String estado, String tipo, String origen, String comportamiento, String descripcion) {
        super(id, nombre, apellidos, tipo, descripcion);
        this.estado = estado;
        this.origen = origen;
        this.comportamiento = comportamiento;
    }

}