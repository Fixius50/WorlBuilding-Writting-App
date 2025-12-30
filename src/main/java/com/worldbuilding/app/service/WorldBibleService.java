package com.worldbuilding.app.service;

import com.worldbuilding.app.model.*;
import com.worldbuilding.app.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class WorldBibleService {

    @Autowired
    private CarpetaRepository carpetaRepository;

    @Autowired
    private EntidadGenericaRepository entidadGenericaRepository;

    @Autowired
    private AtributoPlantillaRepository atributoPlantillaRepository;

    @Autowired
    private AtributoValorRepository atributoValorRepository;

    // --- CARPETAS ---

    public List<Carpeta> getRootFolders(Cuaderno proyecto) {
        return carpetaRepository.findByProyectoAndPadreIsNull(proyecto);
    }

    public List<Carpeta> getSubfolders(Long padreId) {
        Optional<Carpeta> padre = carpetaRepository.findById(padreId);
        return padre.map(carpetaRepository::findByPadre).orElse(new ArrayList<>());
    }

    @Transactional
    public Carpeta createFolder(String nombre, Cuaderno proyecto, Long padreId) {
        Carpeta carpeta = new Carpeta();
        carpeta.setNombre(nombre);
        carpeta.setProyecto(proyecto);
        if (padreId != null) {
            carpetaRepository.findById(padreId).ifPresent(carpeta::setPadre);
        }
        return carpetaRepository.save(carpeta);
    }

    // --- ENTIDADES ---

    @Transactional
    public EntidadGenerica createEntity(String nombre, Cuaderno proyecto, Long carpetaId, String tipoEspecial) {
        Optional<Carpeta> carpetaOpt = carpetaRepository.findById(carpetaId);
        if (carpetaOpt.isEmpty())
            throw new RuntimeException("Folder not found");

        Carpeta carpeta = carpetaOpt.get();
        EntidadGenerica entidad = new EntidadGenerica();
        entidad.setNombre(nombre);
        entidad.setProyecto(proyecto);
        entidad.setCarpeta(carpeta);
        entidad.setTipoEspecial(tipoEspecial);

        EntidadGenerica savedEntity = entidadGenericaRepository.save(entidad);

        // Heredar atributos de la carpeta (y sus padres)
        List<AtributoPlantilla> plantillas = getAllInheritedTemplates(carpeta);
        for (AtributoPlantilla plantilla : plantillas) {
            AtributoValor valor = new AtributoValor();
            valor.setEntidad(savedEntity);
            valor.setPlantilla(plantilla);
            valor.setValor(plantilla.getValorDefecto());
            atributoValorRepository.save(valor);
        }

        return savedEntity;
    }

    public List<AtributoPlantilla> getAllInheritedTemplates(Carpeta carpeta) {
        List<AtributoPlantilla> allTemplates = new ArrayList<>();
        Carpeta current = carpeta;
        while (current != null) {
            allTemplates.addAll(atributoPlantillaRepository.findByCarpetaOrderByOrdenVisualAsc(current));
            current = current.getPadre();
        }
        return allTemplates;
    }

    // --- ATRIBUTOS ---

    @Transactional
    public void updateEntityValues(Long entidadId, List<ValueUpdateDTO> updates) {
        for (ValueUpdateDTO update : updates) {
            Optional<AtributoValor> valorOpt = atributoValorRepository.findById(update.getValorId());
            valorOpt.ifPresent(v -> {
                v.setValor(update.getNuevoValor());
                atributoValorRepository.save(v);
            });
        }
    }

    @Transactional
    public AtributoValor addAttributeToEntity(Long entidadId, Long plantillaId) {
        Optional<EntidadGenerica> entidadOpt = entidadGenericaRepository.findById(entidadId);
        Optional<AtributoPlantilla> plantillaOpt = atributoPlantillaRepository.findById(plantillaId);

        if (entidadOpt.isEmpty() || plantillaOpt.isEmpty()) {
            throw new RuntimeException("Entity or Template not found");
        }

        AtributoValor valor = new AtributoValor();
        valor.setEntidad(entidadOpt.get());
        valor.setPlantilla(plantillaOpt.get());
        valor.setValor(plantillaOpt.get().getValorDefecto());
        return atributoValorRepository.save(valor);
    }

    public static class ValueUpdateDTO {
        private Long valorId;
        private String nuevoValor;

        public Long getValorId() {
            return valorId;
        }

        public void setValorId(Long valorId) {
            this.valorId = valorId;
        }

        public String getNuevoValor() {
            return nuevoValor;
        }

        public void setNuevoValor(String nuevoValor) {
            this.nuevoValor = nuevoValor;
        }
    }
}
