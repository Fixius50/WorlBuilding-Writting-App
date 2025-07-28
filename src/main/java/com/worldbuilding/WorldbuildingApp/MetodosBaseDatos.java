package com.worldbuilding.WorldbuildingApp;

import org.springframework.http.ResponseEntity;

public interface MetodosBaseDatos {
    ResponseEntity<?> insertarDatosDTO(String[] valoresExtraTabla);
    ResponseEntity<?> eliminarDatosDTO(String[] valoresExtraTabla);
    ResponseEntity<?> modificarDatosDTO(String[] valoresExtraTabla);
}