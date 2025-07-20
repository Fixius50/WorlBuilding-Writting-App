package com.worldbuilding.WorldbuildingApp.modelos;

import com.fasterxml.jackson.annotation.JsonGetter;
import com.fasterxml.jackson.annotation.JsonSetter;

import jakarta.persistence.Column;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

/**
 * Clase abstracta general que se encarga de modelar el resto de modelos que hacen las conexiones hacia las tablas de la base de datos.
 * Las variables etieutadas son las que reciben los datos o envian desde javaScript
 */
public abstract class ParametrosBaseDatos {

    @Id @Column(name = "id") @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Id @Column(name = "nombre") @GeneratedValue(strategy = GenerationType.IDENTITY)
    protected String nombre;
    @Id @Column(name = "apellidos") @GeneratedValue(strategy = GenerationType.IDENTITY)
    protected String apellidos;
    @Id @Column(name = "tipo") @GeneratedValue(strategy = GenerationType.IDENTITY)
    protected String tipo;
    @Id @Column(name = "descripcion") @GeneratedValue(strategy = GenerationType.IDENTITY)
    protected String descripcion;

    
    public ParametrosBaseDatos(Long id, String nombre, String apellidos, String tipo, String descripcion) {
        this.id = id;
        this.nombre = nombre;
        this.apellidos = apellidos;
        this.descripcion = descripcion;
        this.tipo = tipo;
    }

    // Getters y Setters (comunes)
    @JsonGetter("id")          public Long getId() {return id;}
    @JsonSetter("id")          public void setId(Long id) {this.id = id;}
    @JsonGetter("nombre")      public String getNombre() {return nombre;}
    @JsonSetter("nombre")      public void setNombre(String nombre) {this.nombre = nombre;}
    @JsonGetter("apellidos")   public String getApellidos() {return apellidos;}
    @JsonSetter("apellidos")   public void setApellidos(String apellidos) {this.apellidos = apellidos;}
    @JsonGetter("tipo")        public String getTipo() {return tipo;}
    @JsonSetter("tipo")        public void setTipo(String tipo) {this.tipo = tipo;}
    @JsonGetter("descripcion") public String getDescripcion() {return descripcion;}
    @JsonSetter("descripcion") public void setDescripcion(String descripcion) {this.descripcion = descripcion;}
}