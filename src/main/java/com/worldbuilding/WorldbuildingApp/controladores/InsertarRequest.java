package com.worldbuilding.WorldbuildingApp.controladores;

import java.util.Map;

/**
 * Esta clase es un Objeto de Transferencia de Datos (DTO) que representa
 * la estructura del JSON enviado desde el frontend para insertar datos.
 * Spring Boot la utiliza para deserializar automáticamente la petición.
 */
public class InsertarRequest {

    private int tabla;
    private Map<String, String> datos;

    // Getters y Setters son necesarios para que Spring pueda mapear los datos

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