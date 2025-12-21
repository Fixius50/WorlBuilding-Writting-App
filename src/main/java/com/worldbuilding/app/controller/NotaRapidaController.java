package com.worldbuilding.app.controller;

import com.worldbuilding.app.model.Hoja;
import com.worldbuilding.app.model.NotaRapida;
import com.worldbuilding.app.repository.HojaRepository;
import com.worldbuilding.app.repository.NotaRapidaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/escritura/hoja/{hojaId}/notas")
public class NotaRapidaController {

    @Autowired
    private NotaRapidaRepository notaRapidaRepository;

    @Autowired
    private HojaRepository hojaRepository;

    @GetMapping
    public ResponseEntity<?> listarNotas(@PathVariable Long hojaId) {
        Hoja hoja = hojaRepository.findById(hojaId).orElse(null);
        if (hoja == null)
            return ResponseEntity.status(404).body(Map.of("error", "Hoja no encontrada"));

        List<NotaRapida> notas = notaRapidaRepository.findByHojaOrderByLineaAsc(hoja);
        return ResponseEntity.ok(notas);
    }

    @PostMapping
    public ResponseEntity<?> crearNota(@PathVariable Long hojaId, @RequestBody Map<String, Object> body) {
        Hoja hoja = hojaRepository.findById(hojaId).orElse(null);
        if (hoja == null)
            return ResponseEntity.status(404).body(Map.of("error", "Hoja no encontrada"));

        NotaRapida nota = new NotaRapida();
        nota.setHoja(hoja);
        nota.setContenido((String) body.get("contenido"));
        nota.setLinea((Integer) body.get("linea"));
        nota.setCategoria((String) body.getOrDefault("categoria", "Lore"));

        return ResponseEntity.ok(notaRapidaRepository.save(nota));
    }

    @DeleteMapping("/{notaId}")
    public ResponseEntity<?> eliminarNota(@PathVariable Long notaId) {
        notaRapidaRepository.deleteById(notaId);
        return ResponseEntity.ok(Map.of("success", true));
    }
}
