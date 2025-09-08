package com.worldbuilding.WorldbuildingApp.modelos;

import jakarta.persistence.*;

/**
 * Entidad JPA que representa los datos de la tabla.
 * Se adapta desde el antiguo DTO para persistencia en MySQL.
 */
@Entity
@Table(name = "datos_tabla")
public class DatosTablaDTO {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nombre;
    private String apellidos;
    private String tipo;
    private String descripcion;

    // === Campos para "Entidad" ===
    private String estado;
    private String origenEntidad;
    private String comportamientoEntidad;

    // === Campos para "Construcción" ===
    private String tamannoCons;
    private String desarrolloCons;

    // === Campos para "Zona" ===
    private String tamannoZona;
    private String desarrolloZona;

    // === Campos para "Efectos" ===
    private String origenEfecto;
    private String dureza;
    private String comportamientoEfecto;

    // === Campos para "Relaciones" ===
    private String direccion;
    private String afectados;

    // === Getters y Setters ===
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }

    public String getApellidos() { return apellidos; }
    public void setApellidos(String apellidos) { this.apellidos = apellidos; }

    public String getTipo() { return tipo; }
    public void setTipo(String tipo) { this.tipo = tipo; }

    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }

    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }

    public String getOrigenEntidad() { return origenEntidad; }
    public void setOrigenEntidad(String origenEntidad) { this.origenEntidad = origenEntidad; }

    public String getComportamientoEntidad() { return comportamientoEntidad; }
    public void setComportamientoEntidad(String comportamientoEntidad) { this.comportamientoEntidad = comportamientoEntidad; }

    public String getTamannoCons() { return tamannoCons; }
    public void setTamannoCons(String tamannoCons) { this.tamannoCons = tamannoCons; }

    public String getDesarrolloCons() { return desarrolloCons; }
    public void setDesarrolloCons(String desarrolloCons) { this.desarrolloCons = desarrolloCons; }

    public String getTamannoZona() { return tamannoZona; }
    public void setTamannoZona(String tamannoZona) { this.tamannoZona = tamannoZona; }

    public String getDesarrolloZona() { return desarrolloZona; }
    public void setDesarrolloZona(String desarrolloZona) { this.desarrolloZona = desarrolloZona; }

    public String getOrigenEfecto() { return origenEfecto; }
    public void setOrigenEfecto(String origenEfecto) { this.origenEfecto = origenEfecto; }

    public String getDureza() { return dureza; }
    public void setDureza(String dureza) { this.dureza = dureza; }

    public String getComportamientoEfecto() { return comportamientoEfecto; }
    public void setComportamientoEfecto(String comportamientoEfecto) { this.comportamientoEfecto = comportamientoEfecto; }

    public String getDireccion() { return direccion; }
    public void setDireccion(String direccion) { this.direccion = direccion; }

    public String getAfectados() { return afectados; }
    public void setAfectados(String afectados) { this.afectados = afectados; }
}