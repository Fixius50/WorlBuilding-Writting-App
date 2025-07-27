package com.worldbuilding.WorldbuildingApp.modelos;

public class ProyectoDTO {
    public String nombre;
    public String enfoque;
    public String getNombre() {return nombre;}
    public void setNombre(String nombre) {this.nombre = nombre;}
    public String getEnfoque() {return enfoque;}
    public void setEnfoque(String enfoque) {this.enfoque = enfoque;}
    public ProyectoDTO(String nombre, String enfoque) {
        this.nombre = nombre;
        this.enfoque = enfoque;
    }
}