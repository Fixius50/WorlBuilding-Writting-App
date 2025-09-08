package com.worldbuilding.WorldbuildingApp.modelos;

import jakarta.persistence.*;

/**
 * Entidad JPA para representar un proyecto.
 */
@Entity
@Table(name = "proyecto")
public class Proyecto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nombre;

    @Column(nullable = false)
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
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

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