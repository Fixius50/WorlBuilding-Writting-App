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

    @Autowired
    private org.springframework.jdbc.core.JdbcTemplate jdbcTemplate;

    // @Transactional <-- Removed to allow schema fixes to commit independently
    public void runFullMigration() {
        applySchemaFixes();
        try {
            List<Cuaderno> proyectos = cuadernoRepository.findAll();
            for (Cuaderno proyecto : proyectos) {
                migrateCharacters(proyecto);
                migrateZones(proyecto);
            }
        } catch (Exception e) {
            System.err.println(
                    "Migration logic failed (but schema fixes should persist if DDL auto-commits): " + e.getMessage());
        }
    }

    private void applySchemaFixes() {
        // Fix for missing 'deleted' columns in all relevant tables
        // SQLite doesn't support IF NOT EXISTS in ADD COLUMN in all versions, so we
        // try-catch

        String[] queries = {
                "ALTER TABLE hoja ADD COLUMN deleted BOOLEAN DEFAULT 0",
                "ALTER TABLE hoja ADD COLUMN deleted_date TEXT",
                "ALTER TABLE nota_rapida ADD COLUMN deleted BOOLEAN DEFAULT 0",
                "ALTER TABLE nota_rapida ADD COLUMN deleted_date TEXT",
                "ALTER TABLE entidad_individual ADD COLUMN deleted BOOLEAN DEFAULT 0",
                "ALTER TABLE entidad_individual ADD COLUMN deleted_date TEXT",
                "ALTER TABLE zona ADD COLUMN deleted BOOLEAN DEFAULT 0",
                "ALTER TABLE zona ADD COLUMN deleted_date TEXT"
        };

        for (String sql : queries) {
            try {
                jdbcTemplate.execute(sql);
                System.out.println("Applied schema fix: " + sql);
            } catch (Exception e) {
                // Ignore if column likely exists
                System.out.println("Schema fix skipped (likely exists): " + sql + " | Error: " + e.getMessage());
            }
        }
    }

    private void migrateCharacters(Cuaderno proyecto) {
        List<EntidadIndividual> legacyChars = entidadIndividualRepository
                .findByNombreProyecto(proyecto.getNombreProyecto());
        if (legacyChars.isEmpty())
            return;

        // 1. Get Folder (Must exist)
        Carpeta folder = getExistingFolder(proyecto, "Legacy Characters");

        // 2. Get Templates (Must exist)
        AtributoPlantilla tApellidos = getExistingTemplate(folder, "Apellidos", "short_text", 1);
        AtributoPlantilla tEstado = getExistingTemplate(folder, "Estado", "short_text", 2);
        AtributoPlantilla tTipo = getExistingTemplate(folder, "Tipo", "short_text", 3);
        AtributoPlantilla tOrigen = getExistingTemplate(folder, "Origen", "short_text", 4);
        AtributoPlantilla tComportamiento = getExistingTemplate(folder, "Comportamiento", "text", 5);
        AtributoPlantilla tDesc = getExistingTemplate(folder, "Descripción", "text", 6);

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

        Carpeta folder = getExistingFolder(proyecto, "Legacy Zones");

        AtributoPlantilla tTamanno = getExistingTemplate(folder, "Tamaño", "short_text", 1);
        AtributoPlantilla tTipo = getExistingTemplate(folder, "Tipo", "short_text", 2);
        AtributoPlantilla tDesarrollo = getExistingTemplate(folder, "Desarrollo", "short_text", 3);
        AtributoPlantilla tDesc = getExistingTemplate(folder, "Descripción", "text", 4);

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

    private Carpeta getExistingFolder(Cuaderno proyecto, String name) {
        return carpetaRepository.findByProyectoAndPadreIsNull(proyecto).stream()
                .filter(c -> c.getNombre().equals(name))
                .findFirst()
                .orElseThrow(() -> new RuntimeException(
                        "Migration failed: Target folder '" + name + "' not found. No self-healing allowed."));
    }

    private AtributoPlantilla getExistingTemplate(Carpeta carpeta, String name, String type, int order) {
        return atributoPlantillaRepository.findByCarpetaOrderByOrdenVisualAsc(carpeta).stream()
                .filter(t -> t.getNombre().equals(name))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Migration failed: Target template '" + name
                        + "' not found in folder '" + carpeta.getNombre() + "'."));
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
