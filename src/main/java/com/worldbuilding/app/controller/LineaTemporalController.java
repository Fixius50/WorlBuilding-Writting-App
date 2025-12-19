package com.worldbuilding.app.controller;

import com.worldbuilding.app.model.LineaTemporal;
import com.worldbuilding.app.repository.LineaTemporalRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/timeline/lineas")
public class LineaTemporalController {

    @Autowired
    private LineaTemporalRepository lineaRepository;

    @GetMapping("/universo/{universoId}")
    public List<LineaTemporal> listarPorUniverso(@PathVariable Long universoId) {
        return lineaRepository.findByUniversoId(universoId);
    }

    @PostMapping("/crear")
    @SuppressWarnings("null")
    public LineaTemporal crearLinea(@RequestBody LineaTemporal linea) {
        return lineaRepository.save(linea);
    }

    @DeleteMapping("/{id}")
    public void eliminarLinea(@PathVariable Long id) {
        lineaRepository.deleteById(id);
    }
}
