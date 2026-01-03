package com.worldbuilding.app.repository;

import com.worldbuilding.app.model.AtributoValor;
import com.worldbuilding.app.model.EntidadGenerica;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface AtributoValorRepository extends JpaRepository<AtributoValor, Long> {
    List<AtributoValor> findByEntidad(EntidadGenerica entidad);

    void deleteByPlantillaId(Long plantillaId);
}
