package com.worldbuilding.WorldbuildingApp;

import org.springframework.http.ResponseEntity;
import jakarta.servlet.http.HttpSession;
import java.util.Map;

public interface MetodosBaseDatos {
    ResponseEntity<?> insertarDatosDTO(Map<String, Object> requestBody, HttpSession session);
    ResponseEntity<?> eliminarDatosDTO(Map<String, Object> requestBody, HttpSession session);
    ResponseEntity<?> obtenerDatosDTO(Map<String, Object> requestBody, HttpSession session);
    ResponseEntity<?> modificarDatosDTO(Map<String, Object> requestBody, HttpSession session);
}