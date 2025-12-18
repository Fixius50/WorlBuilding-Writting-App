package com.worldbuilding.app.h2;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

/**
 * Funciones Java para usar como ALIAS en H2.
 * Equivalentes a los procedimientos almacenados de MySQL.
 * 
 * H2 permite registrar métodos estáticos de Java como funciones SQL.
 */
public class H2Functions {

    /**
     * Verifica si existe información del proyecto en la tabla proyecto_info
     */
    public static boolean proyectoExiste(Connection conn, String nombreProyecto) throws SQLException {
        String sql = "SELECT COUNT(*) FROM proyecto_info WHERE nombre_proyecto = ?";
        try (PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, nombreProyecto);
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    return rs.getInt(1) > 0;
                }
            }
        }
        return false;
    }

    /**
     * Activa un nodo para una entidad específica
     */
    public static void activarNodo(Connection conn, Long entidadId, String tipoEntidad, String caracteristica)
            throws SQLException {
        // Verificar si ya existe
        String checkSql = "SELECT COUNT(*) FROM nodo WHERE entidad_id = ? AND tipo_entidad = ?";
        try (PreparedStatement checkStmt = conn.prepareStatement(checkSql)) {
            checkStmt.setLong(1, entidadId);
            checkStmt.setString(2, tipoEntidad);
            try (ResultSet rs = checkStmt.executeQuery()) {
                if (rs.next() && rs.getInt(1) > 0) {
                    return; // Ya existe
                }
            }
        }

        // Insertar nodo
        String insertSql = "INSERT INTO nodo (entidad_id, tipo_entidad, caracteristica_relacional) VALUES (?, ?, ?)";
        try (PreparedStatement insertStmt = conn.prepareStatement(insertSql)) {
            insertStmt.setLong(1, entidadId);
            insertStmt.setString(2, tipoEntidad);
            insertStmt.setString(3, caracteristica);
            insertStmt.executeUpdate();
        }

        // Marcar entidad como nodo
        String updateSql = "UPDATE " + tipoEntidad + " SET es_nodo = TRUE WHERE id = ?";
        try (PreparedStatement updateStmt = conn.prepareStatement(updateSql)) {
            updateStmt.setLong(1, entidadId);
            updateStmt.executeUpdate();
        }
    }

    /**
     * Relaciona automáticamente nodos que comparten la misma característica
     */
    public static int relacionarPorCaracteristica(Connection conn, String caracteristica, String tipoRelacion)
            throws SQLException {
        String sql = """
                INSERT INTO relacion (nodo_origen_id, nodo_destino_id, tipo_relacion)
                SELECT n1.id, n2.id, ?
                FROM nodo n1
                JOIN nodo n2 ON n1.caracteristica_relacional = n2.caracteristica_relacional
                WHERE n1.id < n2.id
                  AND n1.caracteristica_relacional = ?
                  AND NOT EXISTS (
                      SELECT 1 FROM relacion
                      WHERE nodo_origen_id = n1.id AND nodo_destino_id = n2.id
                  )
                """;

        try (PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, tipoRelacion);
            stmt.setString(2, caracteristica);
            return stmt.executeUpdate();
        }
    }
}
