package com.worldbuilding.WorldbuildingApp.controladores;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.worldbuilding.WorldbuildingApp.MetodosBaseDatos;
import com.worldbuilding.WorldbuildingApp.modelos.DatosTablaDTO;
import com.worldbuilding.WorldbuildingApp.modelos.ProyectoDTO;

/**
 * Esta clase se encarga de realizar las operaciones lógicas de la base de datos del proyecto actual.
 * En lugar de insertar directamente en la DB, escribe llamadas a funciones SQL en el archivo .sql del proyecto activo.
 */
@RestController
@RequestMapping("/api/bd")
public class BDController implements MetodosBaseDatos{

    public ProyectoController proyectoActual;

    // Inyecta la ruta desde el properties
    @Value("${app.data-folder:./data}")
    private String dataFolder = "src/main/data";

    /**
     * Inserta datos en la tabla de un proyecto específico.
     * @param proyecto Nombre del proyecto activo
     * @param tabla Nombre de la tabla
     * @param datos Datos a insertar
     */
    @PutMapping("/insertar")
    @Override
    public void insertarDatosDTO(String[] valoresExtraTabla) {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'insertarDatosDTO'");
    }

    /**
     * Borra datos llamando a las funciones SQL dentro del archivo .sql del proyecto activo
     * @param tabla
     * @param identificador
     * @param session
     * @return
     */
    @DeleteMapping("/eliminar")
    @Override
    public void eliminarDatosDTO(String[] valoresExtraTabla) {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'eliminarDatosDTO'");
    }

    /**
     * Función para activar o desactivar nodos 
     * @param tabla
     * @param identificador
     * @param activo
     * @param session
     * @return
     */
    @PatchMapping("/modificar")
    @Override
    public void modificarDatosDTO(String[] valoresExtraTabla) {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'modificarDatosDTO'");
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