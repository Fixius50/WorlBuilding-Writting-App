package com.worldbuilding.WorldbuildingApp;

public interface MetodosBaseDatos {
    void insertarDatosDTO(String[] valoresExtraTabla);
    void eliminarDatosDTO(String[] valoresExtraTabla);
    void modificarDatosDTO(String[] valoresExtraTabla);
}