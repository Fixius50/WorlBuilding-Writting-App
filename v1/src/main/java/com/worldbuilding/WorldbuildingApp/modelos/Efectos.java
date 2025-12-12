package com.worldbuilding.WorldbuildingApp.modelos;

import jakarta.persistence.*;

@Entity
@Table(name = "efectos")
public class Efectos {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    private String nombreProyecto;
    private String nombre;
    private String apellidos;
    private String origen;
    private String dureza; // este es el tipo
    private String comportamiento;
    
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
    public String getOrigen() { return origen; }
    public void setOrigen(String origen) { this.origen = origen; }
    public String getDureza() { return dureza; }
    public void setDureza(String dureza) { this.dureza = dureza; }
    public String getComportamiento() { return comportamiento; }
    public void setComportamiento(String comportamiento) { this.comportamiento = comportamiento; }
    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }
    public boolean isEsNodo() { return esNodo; }
    public void setEsNodo(boolean esNodo) { this.esNodo = esNodo; }
}