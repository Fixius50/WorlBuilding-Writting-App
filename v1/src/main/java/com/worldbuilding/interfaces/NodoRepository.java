package com.worldbuilding.interfaces;

import com.worldbuilding.WorldbuildingApp.modelos.Nodo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.jpa.repository.Modifying;

@Repository
public interface NodoRepository extends JpaRepository<Nodo, Integer> {

    // Llama a tu procedimiento para relacionar nodos
    @Transactional
    @Modifying
    @Query(value = "CALL relacionarPorCaracteristica(:caracteristica, :tipoRelacion)", nativeQuery = true)
    void relacionarPorCaracteristica(@Param("caracteristica") String caracteristica, @Param("tipoRelacion") String tipoRelacion);

    // (Nota: 'verRelacionados' es un SELECT, se manejaría de forma diferente si es necesario)
}