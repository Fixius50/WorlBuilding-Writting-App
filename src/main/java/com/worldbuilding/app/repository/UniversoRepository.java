package com.worldbuilding.app.repository;

import com.worldbuilding.app.model.Universo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UniversoRepository extends JpaRepository<Universo, Long> {
    List<Universo> findByCuadernoId(Long cuadernoId);
}
