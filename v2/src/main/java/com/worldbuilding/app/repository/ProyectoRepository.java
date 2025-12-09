package com.worldbuilding.app.repository;

import com.worldbuilding.app.model.Proyecto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ProyectoRepository extends JpaRepository<Proyecto, Long> {
    Optional<Proyecto> findByNombreProyecto(String nombreProyecto);

    boolean existsByNombreProyecto(String nombreProyecto);
}
