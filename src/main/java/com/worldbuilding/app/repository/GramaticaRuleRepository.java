package com.worldbuilding.app.repository;

import com.worldbuilding.app.model.GramaticaRule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface GramaticaRuleRepository extends JpaRepository<GramaticaRule, Long> {
    List<GramaticaRule> findByConlangId(Long conlangId);
}
