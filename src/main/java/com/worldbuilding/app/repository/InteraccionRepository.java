package com.worldbuilding.app.repository;

import com.worldbuilding.app.model.Interaccion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InteraccionRepository extends JpaRepository<Interaccion, Long> {
    List<Interaccion> findByNombreProyecto(String nombreProyecto);
}
