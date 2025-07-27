package com.worldbuilding.WorldbuildingApp.controladores;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import org.springframework.web.bind.annotation.RestController;

import com.worldbuilding.WorldbuildingApp.modelos.DatosTablaDTO;
import com.worldbuilding.WorldbuildingApp.modelos.ProyectoDTO;

/**
 * Esta clase se encarga de realizar las operaciones lógicas de la base de datos del proyecto actual.
 * En lugar de insertar directamente en la DB, escribe llamadas a funciones SQL en el archivo .sql del proyecto activo.
 */
@RestController
@RequestMapping("/api/bd")
public class BDController{

    /**
     * Inserta datos en la tabla de un proyecto específico.
     * @param proyecto Nombre del proyecto activo
     * @param tabla Nombre de la tabla
     * @param datos Datos a insertar
     */
    @PutMapping("/insertar")
    public ResponseEntity<DatosTablaDTO<ProyectoDTO>> insertarDatosDB(@RequestBody DatosTablaDTO<ProyectoDTO> request) {
        
        return new ResponseEntity<>(request);
    }

    /**
     * Borra datos llamando a las funciones SQL dentro del archivo .sql del proyecto activo
     * @param tabla
     * @param identificador
     * @param session
     * @return
     */
    @DeleteMapping("/borrar")
    public ResponseEntity<DatosTablaDTO<ProyectoDTO>> borrarDatosDB(@RequestBody DatosTablaDTO<ProyectoDTO> request) {

        return ResponseEntity.ok("Datos borrados correctamente");
    }

    /**
     * Función para activar o desactivar nodos 
     * @param tabla
     * @param identificador
     * @param activo
     * @param session
     * @return
     */
    @PatchMapping("/cambiarEstado")
    public ResponseEntity<DatosTablaDTO<ProyectoDTO>> cambiarEstadoNodo(@RequestBody DatosTablaDTO<ProyectoDTO> request) {

        return ResponseEntity.ok("Estado cambiado correctamente");
    }

    /**
     * Función para relacionar elementos entre sí
     * @param origen
     * @param destino
     * @param tipoRelacion
     * @param session
     * @return
     */
    @PostMapping("/relacionar")
    public ResponseEntity<DatosTablaDTO<ProyectoDTO>> relacionarElementos(@RequestBody DatosTablaDTO<ProyectoDTO> request) {

        return ResponseEntity.ok("Elementos relacionados correctamente");
    }
}