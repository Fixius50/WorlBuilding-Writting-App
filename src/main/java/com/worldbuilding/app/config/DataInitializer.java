package com.worldbuilding.app.config;

import com.worldbuilding.app.model.Cuaderno;
import com.worldbuilding.app.repository.CuadernoRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.jdbc.core.JdbcTemplate;

@Component
public class DataInitializer implements org.springframework.boot.CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);

    @Autowired
    private CuadernoRepository cuadernoRepository;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) throws Exception {
        logger.info(">>> [DataInitializer] STARTING INITIALIZATION...");

        // Ensure context is set to Prime World
        TenantContext.setCurrentTenant("Prime World");

        try {
            // Optional: Wipe if ghost data appears in Prime World too (Unlikely but safe)
            long count = cuadernoRepository.count();
            if (count > 0) {
                logger.warn(">>> [DataInitializer] Found " + count + " potential ghost rows. Wiping Prime World...");
                jdbcTemplate.update("DELETE FROM hoja");
                jdbcTemplate.update("DELETE FROM universo");
                jdbcTemplate.update("DELETE FROM carpeta");
                jdbcTemplate.update("DELETE FROM entidad_generica");
                jdbcTemplate.update("DELETE FROM cuaderno");
            }

            // Verify clean
            boolean exists = cuadernoRepository.count() > 0;

            if (!exists) {
                logger.info(">>> [DataInitializer] 'Prime World' missing. Creating...");
                Cuaderno def = new Cuaderno();
                def.setTitulo("Prime World");
                def.setNombreProyecto("Prime World");
                def.setDescripcion("The foundational world context.");
                cuadernoRepository.save(def);
                logger.info(">>> [DataInitializer] 'Prime World' created successfully.");
            } else {
                logger.info(">>> [DataInitializer] 'Prime World' already exists.");
            }
        } catch (Exception e) {
            logger.error(">>> [DataInitializer] Failed to initialize data: " + e.getMessage(), e);
        } finally {
            TenantContext.clear();
        }
    }
}
