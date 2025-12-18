package com.worldbuilding.app.repository;

import com.worldbuilding.app.model.Hoja;
import com.worldbuilding.app.model.Cuaderno;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface HojaRepository extends JpaRepository<Hoja, Long> {
    List<Hoja> findByCuadernoOrderByNumeroPaginaAsc(Cuaderno cuaderno);

    Hoja findByCuadernoAndNumeroPagina(Cuaderno cuaderno, Integer numeroPagina);
}
