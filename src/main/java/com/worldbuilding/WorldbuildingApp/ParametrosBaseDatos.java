package com.worldbuilding.WorldbuildingApp;

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
    
    // Construcción
    @Id @Column(name = "tamanno") @GeneratedValue(strategy = GenerationType.IDENTITY)
    private String tamanno_cons;
    @Column(name = "desarrollo")
    private String desarrollo_cons;

    // Zona
    @Id @Column(name = "tamanno") @GeneratedValue(strategy = GenerationType.IDENTITY)
    private String tamanno_zona;
    @Column(name = "desarrollo")
    private String desarrollo_zona;

    // Efectos
    @Column(name = "origen")
    private String origen_efecto;
    @Column(name = "dureza")
    private String dureza;
    @Column(name = "comportamiento")
    private String comportamiento_efecto;

    // Relacion
    @Column(name = "direccion")
    private String direccion;
    @Column(name = "afectados")
    private String afectados;

    // Entidad individual y colectiva
    @Column(name = "estado")
    private String estado;
    @Column(name = "origen")
    private String origen_entidad;
    @Column(name = "comportamiento")
    private String comportamiento_entidad;
    
    // Setters y getters
    public Long getId() {return id;}
    public void setId(Long id) {this.id = id;}
    public String getNombre() {return nombre;}
    public void setNombre(String nombre) {this.nombre = nombre;}
    public String getApellidos() {return apellidos;}
    public void setApellidos(String apellidos) {this.apellidos = apellidos;}
    public String getTipo() {return tipo;}
    public void setTipo(String tipo) {this.tipo = tipo;}
    public String getDescripcion() {return descripcion;}
    public void setDescripcion(String descripcion) {this.descripcion = descripcion;}
    public String getTamanno_cons() {return tamanno_cons;}
    public void setTamanno_cons(String tamanno_cons) {this.tamanno_cons = tamanno_cons;}
    public String getDesarrollo_cons() {return desarrollo_cons;}
    public void setDesarrollo_cons(String desarrollo_cons) {this.desarrollo_cons = desarrollo_cons;}
    public String getTamanno_zona() {return tamanno_zona;}
    public void setTamanno_zona(String tamanno_zona) {this.tamanno_zona = tamanno_zona;}
    public String getDesarrollo_zona() {return desarrollo_zona;}
    public void setDesarrollo_zona(String desarrollo_zona) {this.desarrollo_zona = desarrollo_zona;}
    public String getOrigen_efecto() {return origen_efecto;}
    public void setOrigen_efecto(String origen_efecto) {this.origen_efecto = origen_efecto;}
    public String getDureza() {return dureza;}
    public void setDureza(String dureza) {this.dureza = dureza;}
    public String getComportamiento_efecto() {return comportamiento_efecto;}
    public void setComportamiento_efecto(String comportamiento_efecto) {this.comportamiento_efecto = comportamiento_efecto;}
    public String getDireccion() {return direccion;}
    public void setDireccion(String direccion) {this.direccion = direccion;}
    public String getAfectados() {return afectados;}
    public void setAfectados(String afectados) {this.afectados = afectados;}
    public String getEstado() {return estado;}
    public void setEstado(String estado) {this.estado = estado;}
    public String getOrigen_entidad() {return origen_entidad;}
    public void setOrigen_entidad(String origen_entidad) {this.origen_entidad = origen_entidad;}
    public String getComportamiento_entidad() {return comportamiento_entidad;}
    public void setComportamiento_entidad(String comportamiento_entidad) {this.comportamiento_entidad = comportamiento_entidad;}
}