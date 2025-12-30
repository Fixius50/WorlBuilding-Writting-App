package com.worldbuilding.app.service;

import com.worldbuilding.app.model.*;
import com.worldbuilding.app.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class MigrationService {

    @Autowired
    private CuadernoRepository cuadernoRepository;
    @Autowired
    private CarpetaRepository carpetaRepository;
    @Autowired
    private EntidadGenericaRepository entidadGenericaRepository;
    @Autowired
    private AtributoPlantillaRepository atributoPlantillaRepository;
    @Autowired
    private AtributoValorRepository atributoValorRepository;

    @Autowired
    private EntidadIndividualRepository entidadIndividualRepository;
    @Autowired
    private ZonaRepository zonaRepository;

    @Transactional
    public void runFullMigration() {
        List<Cuaderno> proyectos = cuadernoRepository.findAll();
        for (Cuaderno proyecto : proyectos) {
            migrateCharacters(proyecto);
            migrateZones(proyecto);
        }
    }

    private void migrateCharacters(Cuaderno proyecto) {
        List<EntidadIndividual> legacyChars = entidadIndividualRepository
                .findByNombreProyecto(proyecto.getNombreProyecto());
        if (legacyChars.isEmpty())
            return;

        // 1. Ensure Folder exists
        Carpeta folder = getOrCreateFolder(proyecto, "Legacy Characters");

        // 2. Ensure Templates exist
        AtributoPlantilla tApellidos = getOrCreateTemplate(folder, "Apellidos", "short_text", 1);
        AtributoPlantilla tEstado = getOrCreateTemplate(folder, "Estado", "short_text", 2);
        AtributoPlantilla tTipo = getOrCreateTemplate(folder, "Tipo", "short_text", 3);
        AtributoPlantilla tOrigen = getOrCreateTemplate(folder, "Origen", "short_text", 4);
        AtributoPlantilla tComportamiento = getOrCreateTemplate(folder, "Comportamiento", "text", 5);
        AtributoPlantilla tDesc = getOrCreateTemplate(folder, "Descripción", "text", 6);

        // 3. Migrate Records
        for (EntidadIndividual old : legacyChars) {
            if (isAlreadyMigrated(proyecto, old.getNombre(), folder))
                continue;

            EntidadGenerica ent = new EntidadGenerica();
            ent.setNombre(old.getNombre());
            ent.setProyecto(proyecto);
            ent.setCarpeta(folder);
            entidadGenericaRepository.save(ent);

            createValue(ent, tApellidos, old.getApellidos());
            createValue(ent, tEstado, old.getEstado());
            createValue(ent, tTipo, old.getTipo());
            createValue(ent, tOrigen, old.getOrigen());
            createValue(ent, tComportamiento, old.getComportamiento());
            createValue(ent, tDesc, old.getDescripcion());
        }
    }

    private void migrateZones(Cuaderno proyecto) {
        List<Zona> legacyZones = zonaRepository.findByNombreProyecto(proyecto.getNombreProyecto());
        if (legacyZones.isEmpty())
            return;

        Carpeta folder = getOrCreateFolder(proyecto, "Legacy Zones");

        AtributoPlantilla tTamanno = getOrCreateTemplate(folder, "Tamaño", "short_text", 1);
        AtributoPlantilla tTipo = getOrCreateTemplate(folder, "Tipo", "short_text", 2);
        AtributoPlantilla tDesarrollo = getOrCreateTemplate(folder, "Desarrollo", "short_text", 3);
        AtributoPlantilla tDesc = getOrCreateTemplate(folder, "Descripción", "text", 4);

        for (Zona old : legacyZones) {
            if (isAlreadyMigrated(proyecto, old.getNombre(), folder))
                continue;

            EntidadGenerica ent = new EntidadGenerica();
            ent.setNombre(old.getNombre());
            ent.setProyecto(proyecto);
            ent.setCarpeta(folder);
            entidadGenericaRepository.save(ent);

            createValue(ent, tTamanno, old.getTamanno());
            createValue(ent, tTipo, old.getTipo());
            createValue(ent, tDesarrollo, old.getDesarrollo());
            createValue(ent, tDesc, old.getDescripcion());
        }
    }

    private Carpeta getOrCreateFolder(Cuaderno proyecto, String name) {
        return carpetaRepository.findByProyectoAndPadreIsNull(proyecto).stream()
                .filter(c -> c.getNombre().equals(name))
                .findFirst()
                .orElseGet(() -> {
                    Carpeta c = new Carpeta();
                    c.setNombre(name);
                    c.setProyecto(proyecto);
                    return carpetaRepository.save(c);
                });
    }

    private AtributoPlantilla getOrCreateTemplate(Carpeta carpeta, String name, String type, int order) {
        return atributoPlantillaRepository.findByCarpetaOrderByOrdenVisualAsc(carpeta).stream()
                .filter(t -> t.getNombre().equals(name))
                .findFirst()
                .orElseGet(() -> {
                    AtributoPlantilla t = new AtributoPlantilla();
                    t.setNombre(name);
                    t.setTipo(type);
                    t.setCarpeta(carpeta);
                    t.setOrdenVisual(order);
                    return atributoPlantillaRepository.save(t);
                });
    }

    private void createValue(EntidadGenerica entity, AtributoPlantilla template, String value) {
        AtributoValor val = new AtributoValor();
        val.setEntidad(entity);
        val.setPlantilla(template);
        val.setValor(value != null ? value : "");
        atributoValorRepository.save(val);
    }

    private boolean isAlreadyMigrated(Cuaderno proyecto, String name, Carpeta folder) {
        // Simple check to avoid duplicates on re-runs
        return entidadGenericaRepository.findByCarpeta(folder).stream()
                .anyMatch(e -> e.getNombre().equals(name));
    }
}
