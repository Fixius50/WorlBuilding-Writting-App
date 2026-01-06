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
        List<Carpeta> folders = carpetaRepository.findByProyectoAndPadreIsNull(proyecto);
        for (Carpeta f : folders) {
            f.setItemCount(carpetaRepository.countByPadre(f) + entidadGenericaRepository.countByCarpeta(f));
        }
        return folders;
    }

    public List<Carpeta> getSubfolders(Long padreId) {
        Optional<Carpeta> padre = carpetaRepository.findById(padreId);
        List<Carpeta> folders = padre.map(carpetaRepository::findByPadre).orElse(new ArrayList<>());
        for (Carpeta f : folders) {
            f.setItemCount(carpetaRepository.countByPadre(f) + entidadGenericaRepository.countByCarpeta(f));
        }
        return folders;
    }

    @Transactional
    public Carpeta createFolder(String nombre, String descripcion, Cuaderno proyecto, Long padreId, String tipo) {
        Carpeta carpeta = new Carpeta();
        carpeta.setNombre(nombre);
        carpeta.setDescripcion(descripcion);
        carpeta.setProyecto(proyecto);
        carpeta.setTipo(tipo);
        carpeta.setTipo(tipo);

        // Generate Slug
        String slug = generateUniqueSlug(nombre, "folder");
        carpeta.setSlug(slug);

        if (padreId != null) {
            carpetaRepository.findById(padreId).ifPresent(carpeta::setPadre);
        }
        // Save first
        Carpeta saved = carpetaRepository.save(carpeta);
        // Set default count (0)
        saved.setItemCount(0);

        if (isContainer(tipo)) {
            generateDefaultStructure(saved, proyecto);
        }

        return saved;
    }

    private boolean isContainer(String tipo) {
        if (tipo == null)
            return false;
        String t = tipo.toUpperCase();
        return t.equals("UNIVERSE") || t.equals("GALAXY") || t.equals("SYSTEM") || t.equals("WORLD")
                || t.equals("PLANET");
    }

    private void generateDefaultStructure(Carpeta parent, Cuaderno proyecto) {
        createSubFolder("Geografía y Lugares", "GEOGRAPHY", parent, proyecto);
        createSubFolder("Entidades y Personajes", "ENTITIES", parent, proyecto);
        createSubFolder("Sistemas de Magia y Poderes", "MAGIC", parent, proyecto);
        createSubFolder("Cronología y Eventos", "TIMELINE", parent, proyecto);
        createSubFolder("Facciones y Organizaciones", "FACTIONS", parent, proyecto);
        createSubFolder("Objetos y Tecnología", "ITEMS", parent, proyecto);
    }

    private void createSubFolder(String name, String type, Carpeta parent, Cuaderno proyecto) {
        Carpeta c = new Carpeta();
        c.setNombre(name);
        c.setTipo(type);
        c.setPadre(parent);
        c.setProyecto(proyecto);
        // Set slug
        c.setSlug(generateUniqueSlug(name, "folder"));
        carpetaRepository.save(c);
    }

    @Transactional
    public Carpeta renameFolder(Long id, String newName) {
        Optional<Carpeta> folderOpt = carpetaRepository.findById(id);
        if (folderOpt.isPresent()) {
            Carpeta folder = folderOpt.get();
            folder.setNombre(newName);
            // Optional: update slug? Usually yes to match name.
            folder.setSlug(generateUniqueSlug(newName, "folder"));
            return carpetaRepository.save(folder);
        }
        throw new RuntimeException("Folder not found");
    }

    @Transactional
    public void deleteFolder(Long id) {
        // Since we have @SQLDelete, this will trigger the soft delete
        carpetaRepository.deleteById(id);
    }

    // --- ENTIDADES ---

    @Transactional
    public EntidadGenerica createEntity(String nombre, Cuaderno proyecto, Long carpetaId, String tipoEspecial,
            String descripcion, String iconUrl) {
        Optional<Carpeta> carpetaOpt = carpetaRepository.findById(carpetaId);
        if (carpetaOpt.isEmpty())
            throw new RuntimeException("Folder not found");

        Carpeta carpeta = carpetaOpt.get();
        EntidadGenerica entidad = new EntidadGenerica();
        entidad.setNombre(nombre);
        entidad.setProyecto(proyecto);
        entidad.setCarpeta(carpeta);
        entidad.setTipoEspecial(tipoEspecial);

        // Generate Slug
        String slug = generateUniqueSlug(nombre, "entity");
        entidad.setSlug(slug);

        // Set optional fields
        entidad.setDescripcion(descripcion != null ? descripcion : "");
        entidad.setIconUrl(iconUrl);
        entidad.setTags("");
        entidad.setTags("");

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

        // 1. Get Global Templates (using Repository - need to add method)
        // For now, assume we filter them manually or query all global=true for project?
        // Better: Custom Query in Repo. "findByProyectoAndGlobalTrue" (but
        // AtributoPlantilla doesn't have project linkage yet, it has Folder).
        // Using "Global = True" attached to ANY folder in project? Or Root?
        // Plan was: Global templates have Global=True.
        // But Repo needs to find them.
        // Workaround: We find ALL templates in the path. Global ones are tricky if they
        // are in "Settings" folder.
        // Let's implement: "Templates in Path" + "Templates in Root with Global=True".
        // Find Root Folder of this Project.
        Carpeta root = getRootFolderOf(carpeta);
        if (root != null) {
            allTemplates.addAll(atributoPlantillaRepository.findByCarpetaAndGlobalTrue(root));
        }

        // 2. Path Inheritance
        Carpeta current = carpeta;
        while (current != null) {
            allTemplates.addAll(atributoPlantillaRepository.findByCarpetaOrderByOrdenVisualAsc(current));
            current = current.getPadre();
        }
        return allTemplates;
    }

    private Carpeta getRootFolderOf(Carpeta c) {
        if (c == null)
            return null;
        Carpeta curr = c;
        while (curr.getPadre() != null) {
            curr = curr.getPadre();
        }
        return curr;
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

    @Transactional
    public AtributoPlantilla createTemplate(Long carpetaId, String nombre, String tipo, String metadata,
            boolean required, boolean global) {
        Optional<Carpeta> carpetaOpt = carpetaRepository.findById(carpetaId);
        if (carpetaOpt.isEmpty())
            throw new RuntimeException("Folder not found");

        AtributoPlantilla plantilla = new AtributoPlantilla();
        plantilla.setCarpeta(carpetaOpt.get());
        plantilla.setNombre(nombre);
        plantilla.setTipo(tipo);
        plantilla.setMetadata(metadata);
        plantilla.setEsObligatorio(required);
        plantilla.setGlobal(global);

        return atributoPlantillaRepository.save(plantilla);
    }

    @Transactional
    public EntidadGenerica updateEntityDetails(Long entityId, String descripcion, String tags) {
        Optional<EntidadGenerica> ent = entidadGenericaRepository.findById(entityId);
        if (ent.isPresent()) {
            EntidadGenerica e = ent.get();
            if (descripcion != null)
                e.setDescripcion(descripcion);
            if (tags != null)
                e.setTags(tags);
            return entidadGenericaRepository.save(e);
        }
        throw new RuntimeException("Entity not found");
    }

    @Transactional
    public void deleteValue(Long id) {
        atributoValorRepository.deleteById(id);
    }

    @Transactional
    public void deleteTemplate(Long id) {
        // Cascade: delete values linked to this template??
        // Usually handled by DB foreign key cascade, or manually.
        // Let's manually delete to be safe if DB isn't strict.
        atributoValorRepository.deleteByPlantillaId(id);
        atributoPlantillaRepository.deleteById(id);
    }

    @Transactional
    public AtributoPlantilla updateTemplate(Long id, String nombre, String tipo, boolean global) {
        Optional<AtributoPlantilla> p = atributoPlantillaRepository.findById(id);
        if (p.isPresent()) {
            AtributoPlantilla plantilla = p.get();
            if (nombre != null)
                plantilla.setNombre(nombre);
            if (tipo != null)
                plantilla.setTipo(tipo);
            plantilla.setGlobal(global);
            return atributoPlantillaRepository.save(plantilla);
        }
        throw new RuntimeException("Template not found");
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

    private String generateUniqueSlug(String name, String type) {
        if (name == null)
            name = "unnamed";
        String baseSlug = name.toLowerCase()
                .replaceAll("[^a-z0-9\\s-]", "")
                .replaceAll("\\s+", "-");

        if (baseSlug.isEmpty())
            baseSlug = "item";

        String uniqueSlug = baseSlug;
        // Simple counter check. For high concurrency this needs improvement, but
        // sufficient here.
        // We check across BOTH tables? No, usually slug collision within type is
        // enough,
        // OR we want global unique?
        // User asked: "Por defecto despues del nombre tienen un 0 y que aumente si hay
        // mas con ese mismo nombre"
        // Let's check collision on the specific table.

        int counter = 0;
        boolean exists;
        do {
            if (type.equals("folder")) {
                exists = carpetaRepository.existsBySlug(uniqueSlug);
            } else {
                exists = entidadGenericaRepository.existsBySlug(uniqueSlug);
            }

            if (exists) {
                uniqueSlug = baseSlug + "-" + counter;
                counter++;
            }
        } while (exists);

        return uniqueSlug;
    }
}
