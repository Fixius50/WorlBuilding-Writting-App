package com.worldbuilding.WorldbuildingApp.modelos;

import jakarta.persistence.*;

/**
 * Entidad JPA para representar un proyecto.
 * MODIFICADA: Ahora usa 'nombre' como @Id (String) para coincidir con tu SQL.
 * La tabla se llama 'crearProyecto' según tu script.
 */
@Entity
@Table(name = "crearProyecto") 
public class Proyecto {

    @Id
    @Column(name = "nombreProyecto", nullable = false, length = 100) // Coincide con tu SQL
    private String nombre;

    @Column(name = "enfoqueProyecto", nullable = false, length = 10) // Coincide con tu SQL
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
    // (Se elimina getId/setId para Long)

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