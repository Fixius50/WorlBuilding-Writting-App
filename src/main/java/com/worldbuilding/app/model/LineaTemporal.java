package com.worldbuilding.app.model;

import jakarta.persistence.*;
import java.util.List;

@Entity
@Table(name = "linea_temporal")
public class LineaTemporal {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nombre;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "universo_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private Universo universo;

    @OneToMany(mappedBy = "lineaTemporal", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<EventoCronologia> eventos;

    // Getters and Setters
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

    public Universo getUniverso() {
        return universo;
    }

    public void setUniverso(Universo universo) {
        this.universo = universo;
    }

    public List<EventoCronologia> getEventos() {
        return eventos;
    }

    public void setEventos(List<EventoCronologia> eventos) {
        this.eventos = eventos;
    }
}
