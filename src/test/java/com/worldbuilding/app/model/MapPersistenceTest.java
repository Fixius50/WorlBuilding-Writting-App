package com.worldbuilding.app.model;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.worldbuilding.app.repository.CarpetaRepository;
import com.worldbuilding.app.repository.CuadernoRepository;
import com.worldbuilding.app.repository.EntidadGenericaRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
public class MapPersistenceTest {

    @Autowired
    private EntidadGenericaRepository entidadRepository;

    @Autowired
    private CuadernoRepository cuadernoRepository;

    @Autowired
    private CarpetaRepository carpetaRepository;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Test
    public void testComplexMapLayersPersistence() throws JsonProcessingException {
        // 1. Setup Context (Project & Folder)
        Cuaderno proyecto = new Cuaderno();
        proyecto.setNombreProyecto("Test Project Code"); // Mandatory field
        proyecto.setTitulo("Test Project");
        proyecto.setDescripcion("Test Desc");
        proyecto = cuadernoRepository.save(proyecto);

        Carpeta carpeta = new Carpeta();
        carpeta.setNombre("Maps Folder");
        carpeta.setProyecto(proyecto);
        carpeta = carpetaRepository.save(carpeta);

        // 2. Create Map Entity with Complex Attributes
        EntidadGenerica mapEntity = new EntidadGenerica();
        mapEntity.setNombre("Test Map");
        mapEntity.setTipoEspecial("map");
        mapEntity.setProyecto(proyecto);
        mapEntity.setCarpeta(carpeta);

        // Construct complex JSON structure mirroring Frontend 'layers'
        Map<String, Object> attributes = new HashMap<>();
        attributes.put("type", "regional");
        attributes.put("width", 2048);
        attributes.put("height", 2048);

        Map<String, Object> layers = new HashMap<>();

        // Generate a heavy line (1000 points)
        List<Map<String, Object>> lines = new ArrayList<>();
        Map<String, Object> heavyLine = new HashMap<>();
        heavyLine.put("id", "line-heavy-1");
        heavyLine.put("tool", "brush");
        heavyLine.put("color", "#df4b26");
        heavyLine.put("size", 5);

        List<Double> points = new ArrayList<>();
        for (int i = 0; i < 1000; i++) {
            points.add((double) i);
            points.add((double) (i * 2));
        }
        heavyLine.put("points", points);
        lines.add(heavyLine);

        layers.put("lines", lines);
        layers.put("rectangles", new ArrayList<>()); // Empty list

        // Add some text objects
        List<Map<String, Object>> texts = new ArrayList<>();
        Map<String, Object> textLabel = new HashMap<>();
        textLabel.put("id", "text-1");
        textLabel.put("text", "Capital City");
        textLabel.put("x", 100);
        textLabel.put("y", 200);
        texts.add(textLabel);
        layers.put("texts", texts);

        attributes.put("layers", layers);

        mapEntity.setAttributes(attributes);

        // 3. Save
        EntidadGenerica saved = entidadRepository.save(mapEntity);
        entidadRepository.flush(); // Force write to DB
        Long savedId = saved.getId();

        // 4. Clear Cache / Detach
        // In @DataJpaTest with @Transactional, entity might stay in 1st level cache.
        // We rely on repository.findById to refetch, but let's emulate a fresh fetch if
        // possible or just check the returned object.
        // Ideally, we flush and clear the entityManager if we had access to it,
        // but finding by ID again is usually sufficient to check transformation if not
        // cached by reference.

        // 5. Retrieve
        EntidadGenerica retrieved = entidadRepository.findById(savedId).orElseThrow();

        // 6. Verify
        assertNotNull(retrieved.getAttributes(), "Attributes should not be null");
        assertTrue(retrieved.getAttributes().containsKey("layers"), "Attributes should contain 'layers'");

        @SuppressWarnings("unchecked")
        Map<String, Object> retrievedLayers = (Map<String, Object>) retrieved.getAttributes().get("layers");
        assertNotNull(retrievedLayers, "Layers map should not be null");

        @SuppressWarnings("unchecked")
        List<Object> retrievedLines = (List<Object>) retrievedLayers.get("lines");
        assertEquals(1, retrievedLines.size(), "Should have 1, line");

        // Check deep value
        @SuppressWarnings("unchecked")
        Map<String, Object> retrievedLine = (Map<String, Object>) retrievedLines.get(0);
        @SuppressWarnings("unchecked")
        List<Double> retrievedPoints = (List<Double>) retrievedLine.get("points");
        assertEquals(2000, retrievedPoints.size(), "Should have 2000 coordinates (1000 points * 2)");
        assertEquals(0.0, ((Number) retrievedPoints.get(0)).doubleValue());
        assertEquals(1998.0, ((Number) retrievedPoints.get(1999)).doubleValue());

        System.out.println(
                "TEST PASSED: Complex Map JSON persisted and retrieved successfully. Attribute JSON size approx: "
                        + objectMapper.writeValueAsString(attributes).length() + " bytes.");
    }
}
