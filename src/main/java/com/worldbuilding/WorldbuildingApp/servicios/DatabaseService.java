package com.worldbuilding.WorldbuildingApp.servicios;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.jdbc.core.RowMapper;

import java.util.List;
import java.util.Map;
import java.util.HashMap;

@Service
public class DatabaseService {
    
    @Autowired
    private JdbcTemplate jdbcTemplate;

    public void ejecutarSQL(String sql) {
        System.out.println("Ejecutando SQL: " + sql);
        jdbcTemplate.execute(sql);
    }

    public Map<String, List<Map<String, Object>>> obtenerDatosProyecto() {
        Map<String, List<Map<String, Object>>> tablas = new HashMap<>();
        
        // Consultar cada tabla
        tablas.put("entidadIndividual", jdbcTemplate.queryForList("SELECT * FROM entidadIndividual"));
        tablas.put("entidadColectiva", jdbcTemplate.queryForList("SELECT * FROM entidadColectiva"));
        tablas.put("construccion", jdbcTemplate.queryForList("SELECT * FROM construccion"));
        tablas.put("zona", jdbcTemplate.queryForList("SELECT * FROM zona"));
        tablas.put("efectos", jdbcTemplate.queryForList("SELECT * FROM efectos"));
        tablas.put("interaccion", jdbcTemplate.queryForList("SELECT * FROM interaccion"));
        
        return tablas;
    }
}