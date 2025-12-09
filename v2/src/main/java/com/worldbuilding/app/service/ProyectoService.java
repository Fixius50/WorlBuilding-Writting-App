package com.worldbuilding.app.service;

import com.worldbuilding.app.model.Proyecto;
import com.worldbuilding.app.repository.ProyectoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ProyectoService {

    @Autowired
    private ProyectoRepository proyectoRepository;

    public Proyecto crear(String nombreProyecto, String tipo) {
        Proyecto proyecto = new Proyecto();
        proyecto.setNombreProyecto(nombreProyecto);
        proyecto.setTipo(tipo);
        return proyectoRepository.save(proyecto);
    }

    public Optional<Proyecto> buscarPorNombre(String nombreProyecto) {
        return proyectoRepository.findByNombreProyecto(nombreProyecto);
    }

    public boolean existe(String nombreProyecto) {
        return proyectoRepository.existsByNombreProyecto(nombreProyecto);
    }

    public List<Proyecto> listarTodos() {
        return proyectoRepository.findAll();
    }

    public void eliminar(Long id) {
        proyectoRepository.deleteById(id);
    }
}
