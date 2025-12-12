package com.worldbuilding.interfaces;

import com.worldbuilding.WorldbuildingApp.modelos.Relacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RelacionRepository extends JpaRepository<Relacion, Integer> {
    // Aquí puedes añadir métodos JPA estándar como findByNodoOrigenId, etc.
}