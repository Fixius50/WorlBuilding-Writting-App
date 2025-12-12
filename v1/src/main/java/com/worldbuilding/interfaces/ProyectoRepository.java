package com.worldbuilding.interfaces;

import com.worldbuilding.WorldbuildingApp.modelos.Proyecto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ProyectoRepository extends JpaRepository<Proyecto, String> { // El ID es String (nombreProyecto)

    // Esto nos permite llamar a tu función SQL 'abrirProyecto'
    @Query(value = "SELECT abrirProyecto(:nombre)", nativeQuery = true)
    boolean abrirProyecto(@Param("nombre") String nombre);
}