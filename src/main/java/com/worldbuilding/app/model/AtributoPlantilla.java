package com.worldbuilding.app.model;

import jakarta.persistence.*;

@Entity
@Table(name = "atributo_plantilla")
public class AtributoPlantilla {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nombre;

    @Column(nullable = false)
    private String tipo; // text, short_text, number, date, select, entity_link, image, boolean, table,
                         // map, timeline

    @Column(name = "valor_defecto", columnDefinition = "CLOB")
    private String valorDefecto;

    @Column(name = "es_obligatorio")
    private boolean esObligatorio = false;

    @Column(columnDefinition = "CLOB")
    private String descripcion;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "carpeta_id", nullable = false)
    private Carpeta carpeta;

    @Column(name = "orden_visual")
    private int ordenVisual = 0;

    // Getters y Setters
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

    public String getTipo() {
        return tipo;
    }

    public void setTipo(String tipo) {
        this.tipo = tipo;
    }

    public String getValorDefecto() {
        return valorDefecto;
    }

    public void setValorDefecto(String valorDefecto) {
        this.valorDefecto = valorDefecto;
    }

    public boolean isEsObligatorio() {
        return esObligatorio;
    }

    public void setEsObligatorio(boolean esObligatorio) {
        this.esObligatorio = esObligatorio;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }

    public Carpeta getCarpeta() {
        return carpeta;
    }

    public void setCarpeta(Carpeta carpeta) {
        this.carpeta = carpeta;
    }

    public int getOrdenVisual() {
        return ordenVisual;
    }

    public void setOrdenVisual(int ordenVisual) {
        this.ordenVisual = ordenVisual;
    }
}
