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

        // [TARGET DB]: Force context to 'Prime World'.
        // This ensures the following JPA operations run against
        // 'src/main/resources/data/Prime World.db'
        TenantContext.setCurrentTenant("Prime World");

        try {
            // Correct Logic: Only initialize if EMPTY. Do NOT wipe existing data.
            long count = cuadernoRepository.count();
            if (count > 0) {
                logger.info(">>> [DataInitializer] Found " + count
                        + " existing records in Prime World. Skipping initialization.");
            } else {
                // Initialize only if empty
                logger.info(">>> [DataInitializer] 'Prime World' is empty. performing clean init...");
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
