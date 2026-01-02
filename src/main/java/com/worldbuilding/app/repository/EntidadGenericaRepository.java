package com.worldbuilding.app.repository;

import com.worldbuilding.app.model.EntidadGenerica;
import com.worldbuilding.app.model.Carpeta;
import com.worldbuilding.app.model.Cuaderno;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface EntidadGenericaRepository extends JpaRepository<EntidadGenerica, Long> {
    List<EntidadGenerica> findByProyecto(Cuaderno proyecto);

    Optional<EntidadGenerica> findBySlug(String slug);

    boolean existsBySlug(String slug);

    int countBySlugStartingWith(String slugPrefix);

    List<EntidadGenerica> findByCarpeta(Carpeta carpeta);

    // Count items
    int countByCarpeta(Carpeta carpeta);
}
