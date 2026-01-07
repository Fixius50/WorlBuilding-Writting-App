package com.worldbuilding.app.repository;

import com.worldbuilding.app.model.AtributoPlantilla;
import com.worldbuilding.app.model.Carpeta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface AtributoPlantillaRepository extends JpaRepository<AtributoPlantilla, Long> {
    List<AtributoPlantilla> findByCarpetaOrderByOrdenVisualAsc(Carpeta carpeta);

    List<AtributoPlantilla> findByCarpetaAndGlobalTrue(Carpeta carpeta);

    List<AtributoPlantilla> findByCarpeta_ProyectoAndGlobalTrue(com.worldbuilding.app.model.Cuaderno proyecto);
}
