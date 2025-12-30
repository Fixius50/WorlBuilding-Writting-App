package com.worldbuilding.app.repository;

import com.worldbuilding.app.model.EntidadGenerica;
import com.worldbuilding.app.model.Carpeta;
import com.worldbuilding.app.model.Cuaderno;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface EntidadGenericaRepository extends JpaRepository<EntidadGenerica, Long> {
    List<EntidadGenerica> findByProyecto(Cuaderno proyecto);

    List<EntidadGenerica> findByCarpeta(Carpeta carpeta);
}
