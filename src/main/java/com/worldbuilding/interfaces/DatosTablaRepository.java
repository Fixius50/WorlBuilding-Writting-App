package com.worldbuilding.interfaces;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.worldbuilding.WorldbuildingApp.modelos.DatosTablaDTO;

@Repository
public interface DatosTablaRepository extends JpaRepository<DatosTablaDTO, Long> {
}