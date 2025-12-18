package com.worldbuilding.app.model;

import jakarta.persistence.*;

@Entity
@Table(name = "palabra")
public class Palabra {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "conlang_id")
    private Conlang conlang;

    private String lema;
    private String ipa;
    private String definicion;
    private String categoriaGramatical;

    @Column(columnDefinition = "CLOB")
    private String notas;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Conlang getConlang() {
        return conlang;
    }

    public void setConlang(Conlang conlang) {
        this.conlang = conlang;
    }

    public String getLema() {
        return lema;
    }

    public void setLema(String lema) {
        this.lema = lema;
    }

    public String getIpa() {
        return ipa;
    }

    public void setIpa(String ipa) {
        this.ipa = ipa;
    }

    public String getDefinicion() {
        return definicion;
    }

    public void setDefinicion(String definicion) {
        this.definicion = definicion;
    }

    public String getCategoriaGramatical() {
        return categoriaGramatical;
    }

    public void setCategoriaGramatical(String categoriaGramatical) {
        this.categoriaGramatical = categoriaGramatical;
    }

    public String getNotas() {
        return notas;
    }

    public void setNotas(String notas) {
        this.notas = notas;
    }
}
