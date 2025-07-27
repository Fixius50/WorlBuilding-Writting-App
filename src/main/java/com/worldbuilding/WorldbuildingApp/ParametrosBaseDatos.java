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

    // Interacción
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
    
}