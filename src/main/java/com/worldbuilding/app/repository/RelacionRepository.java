package com.worldbuilding.app.repository;

import com.worldbuilding.app.model.Relacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RelacionRepository extends JpaRepository<Relacion, Long> {
    List<Relacion> findByNodoOrigenIdOrNodoDestinoId(Long nodoOrigenId, Long nodoDestinoId);

    List<Relacion> findByNodoOrigenIdAndTipoOrigen(Long nodoOrigenId, String tipoOrigen);

    List<Relacion> findByNodoDestinoIdAndTipoDestino(Long nodoDestinoId, String tipoDestino);

    // Find all relationships for a node (either as origin or destination)
    @Query("SELECT r FROM Relacion r WHERE (r.nodoOrigenId = :id AND r.tipoOrigen = :type) OR (r.nodoDestinoId = :id AND r.tipoDestino = :type)")
    List<Relacion> findAllByNode(@Param("id") Long id, @Param("type") String type);
}
