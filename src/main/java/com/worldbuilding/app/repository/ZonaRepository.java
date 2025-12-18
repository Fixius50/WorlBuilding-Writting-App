package com.worldbuilding.app.repository;

import com.worldbuilding.app.model.Zona;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ZonaRepository extends JpaRepository<Zona, Long> {
    List<Zona> findByNombreProyecto(String nombreProyecto);
}
