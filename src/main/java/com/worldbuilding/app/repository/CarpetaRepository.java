package com.worldbuilding.app.repository;

import com.worldbuilding.app.model.Carpeta;
import com.worldbuilding.app.model.Cuaderno;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface CarpetaRepository extends JpaRepository<Carpeta, Long> {
    List<Carpeta> findByProyecto(Cuaderno proyecto);

    List<Carpeta> findByProyectoAndPadreIsNull(Cuaderno proyecto);

    Optional<Carpeta> findBySlug(String slug);

    boolean existsBySlug(String slug);

    int countBySlugStartingWith(String slugPrefix);

    List<Carpeta> findByPadre(Carpeta padre);

    // Count items
    int countByPadre(Carpeta padre);
}
