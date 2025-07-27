package com.worldbuilding.WorldbuildingApp.modelos;

import java.nio.file.Paths;

import org.hibernate.exception.DataException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.jpa.domain.JpaSort.Path;

import com.worldbuilding.WorldbuildingApp.MetodosBaseDatos;
import com.worldbuilding.WorldbuildingApp.ParametrosBaseDatos;

/**
 * DTO para hacer inserciones y recoger datos de la base de datos. Lleva un generico de ProyectoDTO para indicar cual es el proyecto al que está.
 */
public class DatosTablaDTO<ProyectoDTO> extends ParametrosBaseDatos{

    // Constructor vacio que no debe hacer nada
    public DatosTablaDTO(){}

    /**
     * Constructor que debe obtener los componentes que solicitan las tablas + los valores opcionales a esta
     * @param id
     * @param nombre
     * @param apellidos
     * @param tipo
     * @param descripcion
     * @param valoresExtraTabla = El primer valor [0] debe ser el tipo de tabla al que hace referencia; el resto son sus valores seguidos
     */
    public DatosTablaDTO(Long id, String nombre, String apellidos, String tipo, String descripcion, String[] valoresExtraTabla) throws DataException{
        // Comprobamos que el array lleva valores no nulos
        for (int i = 0; i < valoresExtraTabla.length; i++) {
            if(valoresExtraTabla[i].equals("") || valoresExtraTabla[i].equals(null)){
                throw new DataException("Error en los valores requeridos para la tabla o el tipo de tabla.", null);
            }
        }
        this.nombre = nombre;
        this.apellidos = apellidos;
        this.tipo = tipo;
        this.descripcion = descripcion;
        switch (valoresExtraTabla[0]) {
            case "Entidad-Individual":
                this.setEstado(valoresExtraTabla[1]);
                this.setOrigen_entidad(valoresExtraTabla[2]);
                this.setComportamiento_entidad(valoresExtraTabla[3]);
            break;
            case "Entidad-Colectiva":
                this.setEstado(valoresExtraTabla[1]);
                this.setOrigen_entidad(valoresExtraTabla[2]);
                this.setComportamiento_entidad(valoresExtraTabla[3]);
            break;
            case "Construccion":
                this.setTamanno_cons(valoresExtraTabla[1]);
                this.setDesarrollo_cons(valoresExtraTabla[2]);
            break;
            case "Zona":
                this.setTamanno_zona(valoresExtraTabla[1]);
                this.setDesarrollo_zona(valoresExtraTabla[2]);
            break;
            case "Efecto":
                this.setOrigen_efecto(valoresExtraTabla[1]);
                this.setDureza(valoresExtraTabla[2]);
                this.setComportamiento_efecto(valoresExtraTabla[3]);
            break;
            case "Relacion":
                this.setDireccion(valoresExtraTabla[1]);
                this.setAfectados(valoresExtraTabla[2]);
            break;
            // El default indica que no se ha puesto la tabla referente
            default: throw new DataException("Error en los valores requeridos para la tabla o el tipo de tabla.", null);
        }
    }
}