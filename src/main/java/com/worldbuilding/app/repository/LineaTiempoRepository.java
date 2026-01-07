package com.worldbuilding.app.repository;

import com.worldbuilding.app.model.LineaTiempo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LineaTiempoRepository extends JpaRepository<LineaTiempo, Long> {
    List<LineaTiempo> findByEsRaizTrue();

    List<LineaTiempo> findByUniversoId(Long universoId);
}
