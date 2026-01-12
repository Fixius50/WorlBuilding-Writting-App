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
    @org.springframework.data.jpa.repository.Query("SELECT e FROM EntidadGenerica e WHERE e.proyecto = :proyecto AND e.deleted = false AND e.carpeta.deleted = false")
    List<EntidadGenerica> findByProyecto(Cuaderno proyecto);

    @org.springframework.data.jpa.repository.Query("SELECT e FROM EntidadGenerica e WHERE e.proyecto = :proyecto AND e.favorite = true AND e.deleted = false AND e.carpeta.deleted = false")
    List<EntidadGenerica> findByProyectoAndFavoriteTrue(Cuaderno proyecto);

    Optional<EntidadGenerica> findBySlug(String slug);

    boolean existsBySlug(String slug);

    int countBySlugStartingWith(String slugPrefix);

    List<EntidadGenerica> findByCarpeta(Carpeta carpeta);

    // Count items
    int countByCarpeta(Carpeta carpeta);

    @org.springframework.data.jpa.repository.Query("SELECT e FROM EntidadGenerica e WHERE e.proyecto.nombreProyecto = :nombreProyecto AND e.tipoEspecial = :tipoEspecial AND e.deleted = false")
    List<EntidadGenerica> findByNombreProyectoAndTipoEspecial(String nombreProyecto, String tipoEspecial);

    @org.springframework.data.jpa.repository.Query("SELECT e FROM EntidadGenerica e WHERE e.proyecto.nombreProyecto = :nombreProyecto AND e.deleted = false")
    List<EntidadGenerica> findByNombreProyecto(String nombreProyecto);
}
