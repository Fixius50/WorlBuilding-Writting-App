package com.worldbuilding.app.repository;

import com.worldbuilding.app.model.EntidadIndividual;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EntidadIndividualRepository extends JpaRepository<EntidadIndividual, Long> {
    List<EntidadIndividual> findByNombreProyecto(String nombreProyecto);
}
