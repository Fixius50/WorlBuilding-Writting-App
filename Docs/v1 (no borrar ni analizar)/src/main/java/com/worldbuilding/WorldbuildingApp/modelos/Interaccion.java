package com.worldbuilding.WorldbuildingApp.modelos;

import jakarta.persistence.*;

@Entity
@Table(name = "interaccion")
public class Interaccion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    private String nombreProyecto;
    private String nombre;
    private String apellidos;
    private String direccion;
    private String tipo;
    private String afectados;

    @Column(columnDefinition = "MEDIUMTEXT")
    private String descripcion;
    
    @Column(name = "es_nodo")
    private boolean esNodo = false;

    // Getters y Setters
    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    public String getNombreProyecto() { return nombreProyecto; }
    public void setNombreProyecto(String nombreProyecto) { this.nombreProyecto = nombreProyecto; }
    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }
    public String getApellidos() { return apellidos; }
    public void setApellidos(String apellidos) { this.apellidos = apellidos; }
    public String getDireccion() { return direccion; }
    public void setDireccion(String direccion) { this.direccion = direccion; }
    public String getTipo() { return tipo; }
    public void setTipo(String tipo) { this.tipo = tipo; }
    public String getAfectados() { return afectados; }
    public void setAfectados(String afectados) { this.afectados = afectados; }
    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }
    public boolean isEsNodo() { return esNodo; }
    public void setEsNodo(boolean esNodo) { this.esNodo = esNodo; }
}