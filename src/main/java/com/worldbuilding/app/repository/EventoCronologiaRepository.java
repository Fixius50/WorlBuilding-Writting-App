package com.worldbuilding.app.repository;

import com.worldbuilding.app.model.EventoCronologia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EventoCronologiaRepository extends JpaRepository<EventoCronologia, Long> {
    List<EventoCronologia> findAllByOrderByOrdenCronologicoAsc(); // Keep for legacy if needed

    List<EventoCronologia> findByLineaTemporalIdOrderByOrdenCronologicoAsc(Long lineaTemporalId);
}
