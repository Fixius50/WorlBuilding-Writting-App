package com.worldbuilding.app.controller;

import com.worldbuilding.app.model.Conlang;
import com.worldbuilding.app.model.Palabra;
import com.worldbuilding.app.repository.ConlangRepository;
import com.worldbuilding.app.repository.PalabraRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/conlang")
public class ConlangController {

    @Autowired
    private ConlangRepository conlangRepository;

    @Autowired
    private PalabraRepository palabraRepository;

    @GetMapping("/lenguas")
    public List<Conlang> listarLenguas() {
        return conlangRepository.findAll();
    }

    @PostMapping("/lengua")
    public Conlang crearLengua(@RequestBody Conlang conlang) {
        return conlangRepository.save(conlang);
    }

    @GetMapping("/{id}/diccionario")
    public List<Palabra> listarDiccionario(@PathVariable Long id) {
        return palabraRepository.findByConlangId(id);
    }

    @PostMapping("/{id}/palabra")
    public Palabra agregarPalabra(@PathVariable Long id, @RequestBody Palabra palabra) {
        // En una app real, buscaríamos la entidad Conlang y la asignaríamos
        // Aquí asumimos que el objeto palabra ya tiene el ID o lo seteamos manualmente
        // si es posible,
        // pero JPA requiere la entidad Conlang.
        // Simplificación:
        Conlang c = conlangRepository.findById(id).orElseThrow();
        palabra.setConlang(c);
        return palabraRepository.save(palabra);
    }
}
