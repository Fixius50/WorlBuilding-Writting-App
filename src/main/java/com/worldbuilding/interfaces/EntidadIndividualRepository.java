package com.worldbuilding.interfaces;

import com.worldbuilding.WorldbuildingApp.modelos.EntidadIndividual;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.jpa.repository.Modifying;

@Repository
public interface EntidadIndividualRepository extends JpaRepository<EntidadIndividual, Integer> {

    // Esto nos permite llamar a tu Procedimiento Almacenado SQL 'activarNodo'
    @Transactional
    @Modifying
    @Query(value = "CALL activarNodo(:entidadID, 'entidadIndividual', :caracteristica)", nativeQuery = true)
    void activarNodo(@Param("entidadID") Integer entidadID, @Param("caracteristica") String caracteristica);
}