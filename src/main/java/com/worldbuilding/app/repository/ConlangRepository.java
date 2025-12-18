package com.worldbuilding.app.repository;

import com.worldbuilding.app.model.Conlang;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ConlangRepository extends JpaRepository<Conlang, Long> {
}
