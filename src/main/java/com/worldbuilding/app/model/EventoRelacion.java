package com.worldbuilding.app.model;

import jakarta.persistence.*;

@Entity
@Table(name = "evento_relacion")
public class EventoRelacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "evento_origen_id")
    private Long eventoOrigenId;

    @Column(name = "evento_destino_id")
    private Long eventoDestinoId;

    private String tipo; // e.g., "causal", "temporal_loop"

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getEventoOrigenId() {
        return eventoOrigenId;
    }

    public void setEventoOrigenId(Long eventoOrigenId) {
        this.eventoOrigenId = eventoOrigenId;
    }

    public Long getEventoDestinoId() {
        return eventoDestinoId;
    }

    public void setEventoDestinoId(Long eventoDestinoId) {
        this.eventoDestinoId = eventoDestinoId;
    }

    public String getTipo() {
        return tipo;
    }

    public void setTipo(String tipo) {
        this.tipo = tipo;
    }
}
