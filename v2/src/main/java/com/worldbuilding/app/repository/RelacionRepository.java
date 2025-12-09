package com.worldbuilding.app.repository;

import com.worldbuilding.app.model.Relacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RelacionRepository extends JpaRepository<Relacion, Long> {
    List<Relacion> findByNodoOrigenIdOrNodoDestinoId(Long nodoOrigenId, Long nodoDestinoId);
}
