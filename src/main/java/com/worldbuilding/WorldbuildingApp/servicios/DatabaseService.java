package com.worldbuilding.WorldbuildingApp.servicios;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

@Service
public class DatabaseService {
    
    @Autowired
    private JdbcTemplate jdbcTemplate;

    public void ejecutarSQL(String sql) {
        System.out.println("Ejecutando SQL: " + sql);
        jdbcTemplate.execute(sql);
    }
}
