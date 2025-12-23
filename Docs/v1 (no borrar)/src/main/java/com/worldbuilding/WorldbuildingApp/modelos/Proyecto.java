package com.worldbuilding.WorldbuildingApp.modelos;

import jakarta.persistence.*;

/**
 * Entidad JPA para representar un proyecto.
 * El nombre del proyecto es la Clave Primaria.
 */
@Entity
@Table(name = "crearProyecto") // Coincide con tu SQL
public class Proyecto {

    @Id
    @Column(length = 100)
    private String nombreProyecto;

    @Column(nullable = false, length = 50)
    private String enfoqueProyecto;

    // --- Constructores ---
    public Proyecto() {
        // Constructor vacío requerido por JPA
    }

    public Proyecto(String nombre, String enfoque) {
        this.nombreProyecto = nombre;
        this.enfoqueProyecto = enfoque;
    }

    // --- Getters y Setters ---
    public String getNombreProyecto() {
        return nombreProyecto;
    }

    public void setNombreProyecto(String nombreProyecto) {
        this.nombreProyecto = nombreProyecto;
    }

    public String getEnfoqueProyecto() {
        return enfoqueProyecto;
    }

    public void setEnfoqueProyecto(String enfoqueProyecto) {
        this.enfoqueProyecto = enfoqueProyecto;
    }
}
