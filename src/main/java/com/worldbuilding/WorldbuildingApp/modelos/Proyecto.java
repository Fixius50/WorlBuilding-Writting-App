package com.worldbuilding.WorldbuildingApp.modelos;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/**
 * Entidad JPA para representar un proyecto.
 * MODIFICADO: Ahora usa 'nombre' como @Id (String) para coincidir con el SQL.
 */
@Entity
@Table(name = "crearProyecto") // Coincide con tu tabla SQL
public class Proyecto {

    @Id
    @Column(name = "nombreProyecto", nullable = false, length = 100) // Mapea a la columna SQL
    private String nombre;

    @Column(name = "enfoqueProyecto", nullable = false, length = 10) // Mapea a la columna SQL
    private String enfoque;

    // === Constructores ===
    public Proyecto() {
        // Constructor vacío requerido por JPA
    }

    public Proyecto(String nombre, String enfoque) {
        this.nombre = nombre;
        this.enfoque = enfoque;
    }

    // === Getters y Setters ===
    // Ya no hay ID numérico, el nombre ES el ID.
    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getEnfoque() {
        return enfoque;
    }

    public void setEnfoque(String enfoque) {
        this.enfoque = enfoque;
    }
}