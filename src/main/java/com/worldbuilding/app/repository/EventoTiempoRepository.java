package com.worldbuilding.app.repository;

import com.worldbuilding.app.model.EventoTiempo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EventoTiempoRepository extends JpaRepository<EventoTiempo, Long> {
    List<EventoTiempo> findByLineaTiempoIdOrderByOrdenAbsolutoAsc(Long lineaTiempoId);
}
