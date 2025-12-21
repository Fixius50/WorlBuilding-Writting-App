package com.worldbuilding.app.repository;

import com.worldbuilding.app.model.EventoRelacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EventoRelacionRepository extends JpaRepository<EventoRelacion, Long> {
    List<EventoRelacion> findByEventoOrigenId(Long eventoOrigenId);

    List<EventoRelacion> findByEventoDestinoId(Long eventoDestinoId);
}
