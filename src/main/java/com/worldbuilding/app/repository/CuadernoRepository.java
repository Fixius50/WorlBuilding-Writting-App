package com.worldbuilding.app.repository;

import com.worldbuilding.app.model.Cuaderno;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CuadernoRepository extends JpaRepository<Cuaderno, Long> {
    List<Cuaderno> findByNombreProyecto(String nombreProyecto);
}
