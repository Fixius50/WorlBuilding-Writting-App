package com.worldbuilding.WorldbuildingApp.controladores;

import com.worldbuilding.WorldbuildingApp.modelos.DatosTablaDTO;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Repository;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

/**
 * Controlador REST para gestionar DatosTabla con JPA.
 * Incluye el Repository y el Service embebidos.
 */
@RestController
@RequestMapping("/api/datos")
public class DatosTablaController {

    private final DatosTablaService service;

    public DatosTablaController(DatosTablaService service) {
        this.service = service;
    }

    // === ENDPOINTS REST ===

    @GetMapping
    public List<DatosTablaDTO> listar() {
        return service.listar();
    }

    @GetMapping("/{id}")
    public ResponseEntity<DatosTablaDTO> buscarPorId(@PathVariable Long id) {
        return service.buscarPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public DatosTablaDTO crear(@RequestBody DatosTablaDTO datos) {
        return service.guardar(datos);
    }

    @PutMapping("/{id}")
    public ResponseEntity<DatosTablaDTO> actualizar(@PathVariable Long id, @RequestBody DatosTablaDTO datos) {
        return service.buscarPorId(id)
                .map(d -> {
                    datos.setId(id);
                    return ResponseEntity.ok(service.guardar(datos));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        if (service.buscarPorId(id).isPresent()) {
            service.eliminar(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    // === SERVICE ===
    @Service
    public static class DatosTablaService {

        private final DatosTablaRepository repository;

        public DatosTablaService(DatosTablaRepository repository) {
            this.repository = repository;
        }

        public List<DatosTablaDTO> listar() {
            return repository.findAll();
        }

        public Optional<DatosTablaDTO> buscarPorId(Long id) {
            return repository.findById(id);
        }

        public DatosTablaDTO guardar(DatosTablaDTO datos) {
            return repository.save(datos);
        }

        public void eliminar(Long id) {
            repository.deleteById(id);
        }
    }

    // === REPOSITORY ===
    @Repository
    public interface DatosTablaRepository extends JpaRepository<DatosTablaDTO, Long> {
    }
}