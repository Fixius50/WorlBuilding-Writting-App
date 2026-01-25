package com.worldbuilding.app.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements org.springframework.boot.CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);

    @Override
    public void run(String... args) throws Exception {
        logger.info(">>> [DataInitializer] STARTING INITIALIZATION...");

        // [DYNAMIC INITIALIZATION]: No longer forcing a specific world on startup.
        // Projects are healed/initialized on first access to ensure nothing is created
        // by default.
    }
}
