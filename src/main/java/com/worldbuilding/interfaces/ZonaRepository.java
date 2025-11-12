package com.worldbuilding.interfaces;

import com.worldbuilding.WorldbuildingApp.modelos.Zona;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.jpa.repository.Modifying;

@Repository
public interface ZonaRepository extends JpaRepository<Zona, Integer> {

    // Llamada al mismo procedimiento, pero con el tipo 'zona'
    @Transactional
    @Modifying
    @Query(value = "CALL activarNodo(:entidadID, 'zona', :caracteristica)", nativeQuery = true)
    void activarNodo(@Param("entidadID") Integer entidadID, @Param("caracteristica") String caracteristica);
}