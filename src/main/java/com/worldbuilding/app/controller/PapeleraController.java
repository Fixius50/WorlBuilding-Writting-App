package com.worldbuilding.app.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import jakarta.servlet.http.HttpSession;
import java.util.*;

@RestController
@RequestMapping("/api/papelera")
public class PapeleraController {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @GetMapping("/items")
    public ResponseEntity<?> listarItems(HttpSession session) {
        String proyecto = (String) session.getAttribute("proyectoActivo");
        if (proyecto == null) {
            return ResponseEntity.status(400).body(Map.of("error", "No hay proyecto activo"));
        }

        List<Map<String, Object>> items = new ArrayList<>();

        try {
            // Entidades
            items.addAll(jdbcTemplate.queryForList(
                    "SELECT id, nombre, 'EntidadIndividual' as tipo, deleted_date FROM entidad_individual WHERE nombre_proyecto = ? AND deleted = true",
                    proyecto));
            items.addAll(jdbcTemplate.queryForList(
                    "SELECT id, nombre, 'EntidadColectiva' as tipo, deleted_date FROM entidad_colectiva WHERE nombre_proyecto = ? AND deleted = true",
                    proyecto));
            items.addAll(jdbcTemplate.queryForList(
                    "SELECT id, nombre, 'Zona' as tipo, deleted_date FROM zona WHERE nombre_proyecto = ? AND deleted = true",
                    proyecto));
            items.addAll(jdbcTemplate.queryForList(
                    "SELECT id, nombre, 'Construccion' as tipo, deleted_date FROM construccion WHERE nombre_proyecto = ? AND deleted = true",
                    proyecto));
            items.addAll(jdbcTemplate.queryForList(
                    "SELECT id, nombre, 'Efectos' as tipo, deleted_date FROM efectos WHERE nombre_proyecto = ? AND deleted = true",
                    proyecto));
            items.addAll(jdbcTemplate.queryForList(
                    "SELECT id, nombre, 'Interaccion' as tipo, deleted_date FROM interaccion WHERE nombre_proyecto = ? AND deleted = true",
                    proyecto));

            // Notas Rapidas (Join complex)
            // Asumiendo que el contenido puede ser largo, tomamos un substring
            items.addAll(jdbcTemplate.queryForList(
                    "SELECT n.id, SUBSTR(n.contenido, 1, 50) as nombre, 'NotaRapida' as tipo, n.deleted_date " +
                            "FROM nota_rapida n " +
                            "JOIN hoja h ON n.hoja_id = h.id " +
                            "JOIN cuaderno c ON h.cuaderno_id = c.id " +
                            "WHERE c.nombre_proyecto = ? AND n.deleted = true",
                    proyecto));

            return ResponseEntity.ok(items);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Error listando papelera: " + e.getMessage()));
        }
    }

    @PostMapping("/restaurar/{tipo}/{id}")
    public ResponseEntity<?> restaurarItem(@PathVariable String tipo, @PathVariable Long id) {
        try {
            String table = mapTipoToTable(tipo);
            if (table == null)
                return ResponseEntity.badRequest().body(Map.of("error", "Tipo no soportado"));

            String sql = "UPDATE " + table + " SET deleted = false, deleted_date = NULL WHERE id = ?";
            int rows = jdbcTemplate.update(sql, id);

            if (rows > 0) {
                return ResponseEntity.ok(Map.of("success", true, "mensaje", "Restaurado correctamente"));
            } else {
                return ResponseEntity.status(404).body(Map.of("error", "Item no encontrado"));
            }
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/eliminar/{tipo}/{id}")
    public ResponseEntity<?> eliminarDefinitivamente(@PathVariable String tipo, @PathVariable Long id) {
        try {
            String table = mapTipoToTable(tipo);
            if (table == null)
                return ResponseEntity.badRequest().body(Map.of("error", "Tipo no soportado"));

            String sql = "DELETE FROM " + table + " WHERE id = ?";
            int rows = jdbcTemplate.update(sql, id);

            if (rows > 0) {
                return ResponseEntity.ok(Map.of("success", true, "mensaje", "Eliminado definitivamente"));
            } else {
                return ResponseEntity.status(404).body(Map.of("error", "Item no encontrado"));
            }
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    private String mapTipoToTable(String tipo) {
        switch (tipo.toLowerCase()) {
            case "entidadindividual":
                return "entidad_individual";
            case "entidadcolectiva":
                return "entidad_colectiva";
            case "zona":
                return "zona";
            case "construccion":
                return "construccion";
            case "efectos":
                return "efectos";
            case "interaccion":
                return "interaccion";
            case "notarapida":
                return "nota_rapida";
            case "proyecto":
                return "cuaderno"; // En caso de que se implemente
            default:
                return null;
        }
    }
}
