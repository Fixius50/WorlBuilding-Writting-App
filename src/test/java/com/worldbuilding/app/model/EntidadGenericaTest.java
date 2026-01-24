package com.worldbuilding.app.model;

import org.junit.jupiter.api.Test;
import java.util.HashMap;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

class EntidadGenericaTest {

    @Test
    void testJsonAttributes() {
        EntidadGenerica entidad = new EntidadGenerica();
        
        // Verify initial state
        assertNotNull(entidad.getAttributes(), "Attributes should be initialized not null");
        assertTrue(entidad.getAttributes().isEmpty(), "Attributes should be empty initially");

        // Test adding attributes
        Map<String, Object> newAttrs = new HashMap<>();
        newAttrs.put("fire_resistance", 50);
        newAttrs.put("description", "A flaming sword");
        newAttrs.put("is_magical", true);

        entidad.setAttributes(newAttrs);

        assertEquals(3, entidad.getAttributes().size());
        assertEquals(50, entidad.getAttributes().get("fire_resistance"));
        assertEquals("A flaming sword", entidad.getAttributes().get("description"));
        assertEquals(true, entidad.getAttributes().get("is_magical"));
    }
}
