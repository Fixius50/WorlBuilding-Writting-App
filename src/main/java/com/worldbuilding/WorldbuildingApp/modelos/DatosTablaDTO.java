package com.worldbuilding.WorldbuildingApp.modelos;

import com.worldbuilding.WorldbuildingApp.MetodosBaseDatos;
import com.worldbuilding.WorldbuildingApp.ParametrosBaseDatos;

public class DatosTablaDTO<ProyectoDTO> extends ParametrosBaseDatos implements MetodosBaseDatos{

    public DatosTablaDTO(){}

    public DatosTablaDTO(Long id, String nombre, String apellidos, String tipo, String descripcion, String[] valoresExtraTabla){
        ProyectoDTO proyectoActual;
        if (valoresExtraTabla.equals(null)) {
            for (int i = 0; i < valoresExtraTabla.length; i++) {
                valoresExtraTabla[i] = "";
            }
        } else{
            
        }
    }

    @Override
    public void insertarDatos(){};

    @Override
    public void eliminarDatos(){};

    @Override
    public void modificarDatos(){};
}