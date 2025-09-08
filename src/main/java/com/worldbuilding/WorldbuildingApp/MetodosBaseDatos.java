package com.worldbuilding.WorldbuildingApp;

import org.springframework.http.ResponseEntity;
import jakarta.servlet.http.HttpSession;
import java.util.Map;

import com.worldbuilding.WorldbuildingApp.modelos.DatosTablaDTO;

public interface MetodosBaseDatos {
    ResponseEntity<?> insertarDatosDTO(DatosTablaDTO datosDTO, HttpSession session);
    ResponseEntity<?> eliminarDatosDTO(DatosTablaDTO datosDTO, HttpSession session);
    ResponseEntity<?> obtenerDatosDTO(DatosTablaDTO datosDTO, HttpSession session);
    ResponseEntity<?> modificarDatosDTO(DatosTablaDTO datosDTO, HttpSession session);
}