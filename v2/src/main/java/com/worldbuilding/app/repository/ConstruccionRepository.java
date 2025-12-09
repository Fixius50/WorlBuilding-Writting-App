package com.worldbuilding.app.repository;

import com.worldbuilding.app.model.Construccion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ConstruccionRepository extends JpaRepository<Construccion, Long> {
    List<Construccion> findByNombreProyecto(String nombreProyecto);
}
