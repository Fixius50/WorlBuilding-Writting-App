package com.worldbuilding.app.repository;

import com.worldbuilding.app.model.Nodo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NodoRepository extends JpaRepository<Nodo, Long> {
    List<Nodo> findByTipoEntidad(String tipoEntidad);

    List<Nodo> findByCaracteristicaRelacional(String caracteristicaRelacional);

    boolean existsByEntidadIdAndTipoEntidad(Long entidadId, String tipoEntidad);
}
