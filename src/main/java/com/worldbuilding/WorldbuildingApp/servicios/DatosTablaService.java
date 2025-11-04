package com.worldbuilding.WorldbuildingApp.servicios;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.worldbuilding.interfaces.DatosTablaRepository;
import com.worldbuilding.WorldbuildingApp.modelos.DatosTablaDTO;

@Service
public class DatosTablaService {
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
