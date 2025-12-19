package com.worldbuilding.app.model;

import jakarta.persistence.*;

@Entity
@Table(name = "evento_cronologia")
public class EventoCronologia {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String titulo;

    @Column(columnDefinition = "CLOB")
    private String descripcion;

    private String fechaInGame;
    private int ordenCronologico;

    private String tipo;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitulo() {
        return titulo;
    }

    public void setTitulo(String titulo) {
        this.titulo = titulo;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }

    public String getFechaInGame() {
        return fechaInGame;
    }

    public void setFechaInGame(String fechaInGame) {
        this.fechaInGame = fechaInGame;
    }

    public int getOrdenCronologico() {
        return ordenCronologico;
    }

    public void setOrdenCronologico(int ordenCronologico) {
        this.ordenCronologico = ordenCronologico;
    }

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "linea_temporal_id") // Nullable for compatibility/transition
    @com.fasterxml.jackson.annotation.JsonIgnore
    private LineaTemporal lineaTemporal;

    public LineaTemporal getLineaTemporal() {
        return lineaTemporal;
    }

    public void setLineaTemporal(LineaTemporal lineaTemporal) {
        this.lineaTemporal = lineaTemporal;
    }

    public String getTipo() {
        return tipo;
    }

    public void setTipo(String tipo) {
        this.tipo = tipo;
    }
}
