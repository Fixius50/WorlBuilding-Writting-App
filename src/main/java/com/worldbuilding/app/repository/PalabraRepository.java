package com.worldbuilding.app.repository;

import com.worldbuilding.app.model.Palabra;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PalabraRepository extends JpaRepository<Palabra, Long> {
    List<Palabra> findByConlangId(Long conlangId);
}
