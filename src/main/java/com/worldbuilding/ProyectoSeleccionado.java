package com.worldbuilding;

import java.io.*;

/** Esta clase sirve para comprobar de manera general el proyecto creado. Esta clase resuelve el manejo
 * general y control de la información sobre el proyecto creado (tanto para el único como sobretodo para varios).
 * En principio esta clase recoge las acciones tomadas por la clase @see MenuInicialLog y las guarda aquí; junto
 * a cada uno de los html que hay como plantilla para cargar las cosas.
 */
public class ProyectoSeleccionado {
    String nombreProyecto;
    String tipoProyecto;
    File rutaProyecto;
    SQLiteConnector BDProyectoSeleccionado;

    public String getNombreProyecto() {return nombreProyecto;}

    public void setNombreProyecto(String nombreProyecto) {this.nombreProyecto = nombreProyecto;}

    public File getRutaProyecto() {return rutaProyecto;}

    public void setRutaProyecto(File rutaProyecto) {this.rutaProyecto = rutaProyecto;}

    public SQLiteConnector getBDProyectoSeleccionado() {return BDProyectoSeleccionado;}

    public void setBDProyectoSeleccionado(SQLiteConnector bDProyectoSeleccionado) {this.BDProyectoSeleccionado = bDProyectoSeleccionado;}

    public ProyectoSeleccionado(String nombreProyecto, String tipoProyecto, File rutaProyecto, SQLiteConnector BDProyectoSeleccionado){
        this.nombreProyecto = nombreProyecto;
        this.tipoProyecto = tipoProyecto;
        this.rutaProyecto = rutaProyecto;
        this.BDProyectoSeleccionado = BDProyectoSeleccionado;
    }
}