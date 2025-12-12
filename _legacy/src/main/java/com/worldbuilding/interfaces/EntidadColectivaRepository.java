package com.worldbuilding.interfaces;

import com.worldbuilding.WorldbuildingApp.modelos.EntidadColectiva;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.jpa.repository.Modifying;

@Repository
public interface EntidadColectivaRepository extends JpaRepository<EntidadColectiva, Integer> {

    @Transactional
    @Modifying
    @Query(value = "CALL activarNodo(:entidadID, 'entidadColectiva', :caracteristica)", nativeQuery = true)
    void activarNodo(@Param("entidadID") Integer entidadID, @Param("caracteristica") String caracteristica);
}