package com.worldbuilding.app.service;

import com.worldbuilding.app.model.*;
import com.worldbuilding.app.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
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

    @Autowired
    private RelacionRepository relacionRepository;

    @Autowired
    private NodoRepository nodoRepository;

    // --- CARPETAS ---

    public List<Carpeta> getRootFolders(Cuaderno proyecto) {
        List<Carpeta> folders = carpetaRepository.findByProyectoAndPadreIsNull(proyecto);
        if (folders == null) {
            return new ArrayList<>();
        }
        for (Carpeta f : folders) {
            int count = carpetaRepository.countByPadre(f) + entidadGenericaRepository.countByCarpeta(f);
            f.setItemCount(count);
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

    @Transactional(readOnly = true)
    public Map<String, Object> getFolderDetail(Long id) {
        Optional<Carpeta> folderOpt = carpetaRepository.findById(id);
        if (folderOpt.isEmpty())
            return null;

        Carpeta folder = folderOpt.get();
        Map<String, Object> map = new HashMap<>();
        map.put("id", folder.getId());
        map.put("nombre", folder.getNombre());
        map.put("descripcion", folder.getDescripcion());
        map.put("slug", folder.getSlug());
        map.put("tipo", folder.getTipo());
        if (folder.getPadre() != null) {
            map.put("padreId", folder.getPadre().getId());
        } else {
            map.put("padreId", null);
        }

        // Add path for breadcrumbs
        List<Map<String, Object>> path = new ArrayList<>();
        Carpeta current = folder.getPadre();
        while (current != null) {
            Map<String, Object> crumb = new HashMap<>();
            crumb.put("id", current.getId());
            crumb.put("nombre", current.getNombre());
            crumb.put("slug", current.getSlug());
            path.add(0, crumb); // Add to beginning
            current = current.getPadre();
        }
        map.put("path", path);

        return map;
    }

    @Transactional
    public Carpeta renameFolder(Long id, String newName) {
        Optional<Carpeta> folderOpt = carpetaRepository.findById(id);
        if (folderOpt.isPresent()) {
            Carpeta folder = folderOpt.get();
            folder.setNombre(newName);
            // Optional: update slug? Usually yes to match name.
            // DECISION: Do NOT update slug on rename to avoid breaking existing
            // URLs/Bookmarks
            // folder.setSlug(generateUniqueSlug(newName, "folder"));
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
            String descripcion, String iconUrl, String categoria, Map<String, Object> attributes) {
        Optional<Carpeta> carpetaOpt = carpetaRepository.findById(carpetaId);
        System.out.println("DEBUG: createEntity - Tenant: "
                + com.worldbuilding.app.config.TenantContext.getCurrentTenant() + ", FolderID: " + carpetaId);
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
        entidad.setCategoria(categoria);
        entidad.setTags("");
        entidad.setAttributes(attributes); // Save JSON attributes

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

        hydrateEntity(savedEntity);
        return savedEntity;
    }

    @Transactional(readOnly = true)
    public List<AtributoPlantilla> getAllInheritedTemplates(Long folderId) {
        Carpeta c = carpetaRepository.findById(folderId).orElseThrow(() -> new RuntimeException("Folder not found"));
        return getAllInheritedTemplates(c);
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

    public List<EntidadGenerica> getFavorites(Cuaderno proyecto) {
        try {
            List<EntidadGenerica> favorites = entidadGenericaRepository.findByProyectoAndFavoriteTrue(proyecto);
            return favorites != null ? favorites : new ArrayList<>();
        } catch (Exception e) {
            System.err.println("Error in getFavorites: " + e.getMessage());
            e.printStackTrace();
            return new ArrayList<>();
        }
    }

    public List<AtributoPlantilla> getGlobalTemplates(Cuaderno proyecto) {
        return atributoPlantillaRepository.findByCarpeta_ProyectoAndGlobalTrue(proyecto);
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

    @Transactional(readOnly = true)
    public List<EntidadGenerica> getEntitiesInFolder(Carpeta carpeta) {
        List<EntidadGenerica> entidades = entidadGenericaRepository.findByCarpeta(carpeta);
        // Initialize lazy collection
        for (EntidadGenerica e : entidades) {
            hydrateEntity(e);
        }
        return entidades;
    }

    @Transactional(readOnly = true)
    public EntidadGenerica getEntity(String idOrSlug) {
        Optional<EntidadGenerica> opt;
        if (idOrSlug.matches("-?\\d+")) {
            opt = entidadGenericaRepository.findById(Long.parseLong(idOrSlug));
        } else {
            opt = entidadGenericaRepository.findBySlug(idOrSlug);
        }

        if (opt.isPresent()) {
            EntidadGenerica e = opt.get();
            hydrateEntity(e);
            return e;
        }
        return null;
    }

    // --- ATRIBUTOS ---

    @Transactional
    public void updateEntityValues(Long entidadId, List<ValueUpdateDTO> updates) {
        System.out.println(
                "DEBUG: updateEntityValues called for Entity " + entidadId + " with " + updates.size() + " updates");
        for (ValueUpdateDTO update : updates) {
            System.out.println(
                    "DEBUG: Processing update - ID: " + update.getValorId() + ", Value: " + update.getNuevoValor());
            Optional<AtributoValor> valorOpt = atributoValorRepository.findById(update.getValorId());
            if (valorOpt.isPresent()) {
                AtributoValor v = valorOpt.get();
                v.setValor(update.getNuevoValor());
                atributoValorRepository.save(v);
                System.out.println("DEBUG: Saved value for ID " + v.getId() + ": " + v.getValor());
            } else {
                System.out.println("DEBUG: Value ID " + update.getValorId() + " NOT FOUND");
            }
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
    public EntidadGenerica updateEntityDetails(Long entityId, String descripcion, String tags, String apariencia,
            Map<String, Object> attributes) {
        Optional<EntidadGenerica> ent = entidadGenericaRepository.findById(entityId);
        if (ent.isPresent()) {
            EntidadGenerica e = ent.get();
            if (descripcion != null)
                e.setDescripcion(descripcion);
            if (tags != null)
                e.setTags(tags);
            if (apariencia != null)
                e.setApariencia(apariencia);
            if (attributes != null) {
                if (e.getAttributes() == null) {
                    e.setAttributes(new HashMap<>());
                }
                e.getAttributes().putAll(attributes);
            }
            EntidadGenerica saved = entidadGenericaRepository.save(e);
            hydrateEntity(saved);
            return saved;
        }
        throw new RuntimeException("Entity not found");
    }

    @Transactional
    public EntidadGenerica updateEntity(Long id, String nombre, Long carpetaId, String tipoEspecial, String descripcion,
            String iconUrl, String categoria, String apariencia, Map<String, Object> attributes) {
        Optional<EntidadGenerica> entOpt = entidadGenericaRepository.findById(id);
        if (entOpt.isEmpty())
            throw new RuntimeException("Entity not found");

        EntidadGenerica ent = entOpt.get();

        if (nombre != null) {
            ent.setNombre(nombre);
            // Optionally update slug? For maps, maybe yes.
            // ent.setSlug(generateUniqueSlug(nombre, "entity"));
        }

        if (carpetaId != null) {
            Optional<Carpeta> carpetaOpt = carpetaRepository.findById(carpetaId);
            if (carpetaOpt.isPresent()) {
                ent.setCarpeta(carpetaOpt.get());
            }
        }

        if (tipoEspecial != null)
            ent.setTipoEspecial(tipoEspecial);
        if (descripcion != null)
            ent.setDescripcion(descripcion);
        if (iconUrl != null)
            ent.setIconUrl(iconUrl);
        if (categoria != null)
            ent.setCategoria(categoria);
        if (apariencia != null)
            ent.setApariencia(apariencia);

        if (attributes != null) {
            // Merge attributes
            if (ent.getAttributes() == null) {
                ent.setAttributes(new HashMap<>());
            }
            ent.getAttributes().putAll(attributes);
        }

        EntidadGenerica saved = entidadGenericaRepository.save(ent);
        hydrateEntity(saved);
        return saved;
    }

    private void hydrateEntity(EntidadGenerica e) {
        org.hibernate.Hibernate.initialize(e.getCarpeta());
        org.hibernate.Hibernate.initialize(e.getValores());
        if (e.getValores() != null) {
            for (AtributoValor val : e.getValores()) {
                org.hibernate.Hibernate.initialize(val.getPlantilla());
            }
        }
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
    public Map<String, Object> toggleFavorite(Long id) {
        Optional<EntidadGenerica> entOpt = entidadGenericaRepository.findById(id);
        if (entOpt.isPresent()) {
            EntidadGenerica ent = entOpt.get();
            boolean newState = !ent.isFavorite();
            try {
                hydrateEntity(ent); // Fix: Ensure lazy relations are loaded to prevent rollback
                entidadGenericaRepository.save(ent);
                return Map.of("success", true, "id", id, "isFavorite", newState);
            } catch (Exception e) {
                System.err.println("CRITICAL ERROR SAVING FAVORITE: " + e.getMessage());
                e.printStackTrace();
                throw e;
            }
        }
        throw new RuntimeException("Entity not found");
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
        @com.fasterxml.jackson.annotation.JsonProperty("valorId")
        private Long valorId;
        @com.fasterxml.jackson.annotation.JsonProperty("nuevoValor")
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

    @Transactional(readOnly = true)
    public Map<String, Object> getGraphData(Cuaderno proyecto) {
        List<EntidadGenerica> entities = entidadGenericaRepository.findByProyecto(proyecto);
        List<Map<String, Object>> nodes = new ArrayList<>();
        List<Map<String, Object>> edges = new ArrayList<>();

        // Fetch all nodes to get their positions
        List<Nodo> savedNodes = nodoRepository.findAll();
        Map<String, Nodo> nodeMap = new HashMap<>();
        for (Nodo n : savedNodes) {
            String key = n.getTipoEntidad() + ":" + n.getEntidadId();
            nodeMap.put(key, n);
        }

        for (EntidadGenerica e : entities) {
            // 1. Create Node Data
            Map<String, Object> nodeData = new HashMap<>();
            nodeData.put("id", e.getId().toString());
            nodeData.put("label", e.getNombre());
            nodeData.put("category", e.getCategoria() != null ? e.getCategoria() : "Generic");
            nodeData.put("type", e.getTipoEspecial());

            if (e.getIconUrl() != null && !e.getIconUrl().isEmpty()) {
                nodeData.put("icon", e.getIconUrl());
            }

            // --- POSITIONS ---
            // Look for existing node metadata (coordinates)
            String key = e.getCategoria() + ":" + e.getId();
            Nodo savedNode = nodeMap.get(key);

            Map<String, Object> nodeWrapper = new HashMap<>();
            nodeWrapper.put("data", nodeData);

            if (savedNode != null && savedNode.getPosX() != null && savedNode.getPosY() != null) {
                Map<String, Double> position = new HashMap<>();
                position.put("x", savedNode.getPosX());
                position.put("y", savedNode.getPosY());
                nodeWrapper.put("position", position);
            }

            nodes.add(nodeWrapper);

            // 2. Edges (existing logic)
            org.hibernate.Hibernate.initialize(e.getValores());
            if (e.getValores() != null) {
                for (AtributoValor val : e.getValores()) {
                    org.hibernate.Hibernate.initialize(val.getPlantilla());
                    if ("entity_link".equals(val.getPlantilla().getTipo()) && val.getValor() != null) {
                        try {
                            Map<String, Object> edgeData = new HashMap<>();
                            edgeData.put("source", e.getId().toString());
                            edgeData.put("target", val.getValor());
                            edgeData.put("label", val.getPlantilla().getNombre());

                            Map<String, Object> edgeWrapper = new HashMap<>();
                            edgeWrapper.put("data", edgeData);
                            edges.add(edgeWrapper);
                        } catch (Exception ex) {
                        }
                    }
                }
            }
        }

        // New relationships logic
        List<Long> entityIds = entities.stream().map(EntidadGenerica::getId).toList();
        if (!entityIds.isEmpty()) {
            List<Relacion> rels = relacionRepository.findByNodoOrigenIdInOrNodoDestinoIdIn(entityIds, entityIds);
            for (Relacion r : rels) {
                Map<String, Object> edgeData = new HashMap<>();
                edgeData.put("source", r.getNodoOrigenId().toString());
                edgeData.put("target", r.getNodoDestinoId().toString());
                edgeData.put("label", r.getTipoRelacion());
                edgeData.put("id", "rel-" + r.getId());

                Map<String, Object> edgeWrapper = new HashMap<>();
                edgeWrapper.put("data", edgeData);
                edges.add(edgeWrapper);
            }
        }

        return Map.of("nodes", nodes, "edges", edges);
    }

    @Transactional
    public void saveNodePositions(List<NodePositionDTO> positions) {
        for (NodePositionDTO pos : positions) {
            // Find or create Nodo for this entity
            // Note: GeneralGraphView currently uses id as EntidadId, but we might need
            // category
            // The frontend sends { id: "123", x: 10, y: 20, category: "Individual" }
            Long entityId = Long.parseLong(pos.getId());
            String category = pos.getCategory();

            Optional<Nodo> existing = nodoRepository.findAll().stream()
                    .filter(n -> n.getEntidadId().equals(entityId) && n.getTipoEntidad().equals(category))
                    .findFirst();

            Nodo n;
            if (existing.isPresent()) {
                n = existing.get();
            } else {
                n = new Nodo();
                n.setEntidadId(entityId);
                n.setTipoEntidad(category);
            }

            n.setPosX(pos.getX());
            n.setPosY(pos.getY());
            nodoRepository.save(n);
        }
    }

    public static class NodePositionDTO {
        private String id;
        private String category;
        private Double x;
        private Double y;

        public String getId() {
            return id;
        }

        public void setId(String id) {
            this.id = id;
        }

        public String getCategory() {
            return category;
        }

        public void setCategory(String category) {
            this.category = category;
        }

        public Double getX() {
            return x;
        }

        public void setX(Double x) {
            this.x = x;
        }

        public Double getY() {
            return y;
        }

        public void setY(Double y) {
            this.y = y;
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
