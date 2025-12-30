package com.worldbuilding.app.repository;

import com.worldbuilding.app.model.Carpeta;
import com.worldbuilding.app.model.Cuaderno;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CarpetaRepository extends JpaRepository<Carpeta, Long> {
    List<Carpeta> findByProyecto(Cuaderno proyecto);

    List<Carpeta> findByProyectoAndPadreIsNull(Cuaderno proyecto);

    List<Carpeta> findByPadre(Carpeta padre);
}
