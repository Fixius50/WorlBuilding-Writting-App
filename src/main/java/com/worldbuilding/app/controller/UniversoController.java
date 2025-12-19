package com.worldbuilding.app.controller;

import com.worldbuilding.app.model.Universo;
import com.worldbuilding.app.repository.UniversoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.lang.NonNull;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/multiverso")
public class UniversoController {

    @Autowired
    private UniversoRepository universoRepository;

    @GetMapping("/cuaderno/{cuadernoId}")
    @org.springframework.transaction.annotation.Transactional
    public List<Universo> getByCuaderno(@PathVariable @NonNull Long cuadernoId) {
        // En un caso real usaríamos DTOs, pero aquí inicializamos la colección Lazy
        // para evitar el error 500
        List<Universo> universos = universoRepository.findByCuadernoId(cuadernoId);
        universos.forEach(u -> {
            org.hibernate.Hibernate.initialize(u.getLineasTemporales());
            u.getLineasTemporales().forEach(l -> org.hibernate.Hibernate.initialize(l.getEventos()));
        });
        return universos;
    }

    @PostMapping("/crear")
    @SuppressWarnings("null")
    public Universo crearUniverso(@RequestBody Universo universo) {
        // Validation logic needed here (check authentication via token if real)
        return universoRepository.save(universo);
    }

    @DeleteMapping("/{id}")
    public void eliminarUniverso(@PathVariable Long id) {
        universoRepository.deleteById(id);
    }
}
