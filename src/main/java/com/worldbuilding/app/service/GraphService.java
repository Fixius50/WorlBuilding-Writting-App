package com.worldbuilding.app.service;

import com.worldbuilding.app.model.Nodo;
import com.worldbuilding.app.repository.NodoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class GraphService {

    private final NodoRepository nodoRepository;

    public GraphService(NodoRepository nodoRepository) {
        this.nodoRepository = nodoRepository;
    }

    /**
     * Activa un nodo en el sistema de grafos si no existe previamente.
     * Reemplaza la funcionalidad antigua de H2Functions.activarNodo.
     */
    @Transactional
    public void activarNodo(Long entidadId, String tipoEntidad, String caracteristicaRelacional) {
        if (!nodoRepository.existsByEntidadIdAndTipoEntidad(entidadId, tipoEntidad)) {
            Nodo nodo = new Nodo();
            nodo.setEntidadId(entidadId);
            nodo.setTipoEntidad(tipoEntidad);
            nodo.setCaracteristicaRelacional(caracteristicaRelacional);
            nodoRepository.save(nodo);
        }
        // Si ya existe, no hacemos nada (idempotente)
    }
}
