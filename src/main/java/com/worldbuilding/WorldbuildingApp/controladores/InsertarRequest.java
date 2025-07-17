package com.worldbuilding.WorldbuildingApp.controladores;

import java.util.Map;

public class InsertarRequest {
    private int tabla;
    private Map<String, String> datos;

    public int getTabla() {
        return tabla;
    }

    public void setTabla(int tabla) {
        this.tabla = tabla;
    }

    public Map<String, String> getDatos() {
        return datos;
    }

    public void setDatos(Map<String, String> datos) {
        this.datos = datos;
    }
}