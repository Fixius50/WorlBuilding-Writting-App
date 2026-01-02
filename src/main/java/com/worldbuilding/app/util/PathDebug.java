package com.worldbuilding.app.util;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class PathDebug implements CommandLineRunner {

    @Value("${spring.datasource.url}")
    private String datasourceUrl;

    @Override
    public void run(String... args) throws Exception {
        System.out.println("=== PATH DEBUG ===");
        System.out.println("User Dir: " + System.getProperty("user.dir"));
        System.out.println("Datasource URL: " + datasourceUrl);
        System.out.println("==================");
    }
}
