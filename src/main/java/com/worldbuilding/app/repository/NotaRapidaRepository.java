package com.worldbuilding.app.repository;

import com.worldbuilding.app.model.NotaRapida;
import com.worldbuilding.app.model.Hoja;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface NotaRapidaRepository extends JpaRepository<NotaRapida, Long> {
    List<NotaRapida> findByHojaOrderByLineaAsc(Hoja hoja);
}
