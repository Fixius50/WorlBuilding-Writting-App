package com.worldbuilding.app.repository;

import com.worldbuilding.app.model.Conlang;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ConlangRepository extends JpaRepository<Conlang, Long> {
    List<Conlang> findByNombreProyecto(String nombreProyecto);
}
