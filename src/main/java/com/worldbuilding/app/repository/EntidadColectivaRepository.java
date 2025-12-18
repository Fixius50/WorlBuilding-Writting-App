package com.worldbuilding.app.repository;

import com.worldbuilding.app.model.EntidadColectiva;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EntidadColectivaRepository extends JpaRepository<EntidadColectiva, Long> {
    List<EntidadColectiva> findByNombreProyecto(String nombreProyecto);
}
