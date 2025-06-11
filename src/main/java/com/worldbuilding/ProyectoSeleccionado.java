package com.worldbuilding;

import java.io.File;

public class ProyectoSeleccionado {
    private String nombreProyecto;
    private String tipoProyecto;
    private File rutaProyecto; // Mantener como File para el constructor, aunque Path es más moderno
    private SQLiteConnector dbConnector; // Añadido para gestionar la conexión a la BD del proyecto

    public ProyectoSeleccionado(String nombreProyecto, String tipoProyecto, File rutaProyecto, SQLiteConnector dbConnector) {
        this.nombreProyecto = nombreProyecto;
        this.tipoProyecto = tipoProyecto;
        this.rutaProyecto = rutaProyecto;
        this.dbConnector = dbConnector;
    }

    // Getters y Setters
    public String getNombreProyecto() {
        return nombreProyecto;
    }

    public void setNombreProyecto(String nombreProyecto) {
        this.nombreProyecto = nombreProyecto;
    }

    public String getTipoProyecto() {
        return tipoProyecto;
    }

    public void setTipoProyecto(String tipoProyecto) {
        this.tipoProyecto = tipoProyecto;
    }

    public File getRutaProyecto() {
        return rutaProyecto;
    }

    public void setRutaProyecto(File rutaProyecto) {
        this.rutaProyecto = rutaProyecto;
    }

    public SQLiteConnector getDbConnector() {
        return dbConnector;
    }

    public void setDbConnector(SQLiteConnector dbConnector) {
        this.dbConnector = dbConnector;
    }
}