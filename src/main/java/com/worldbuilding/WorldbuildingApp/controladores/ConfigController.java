package com.worldbuilding.WorldbuildingApp.controladores;

import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class ConfigController {

    @Value("${app.data-folder:./data}")
    private String dataFolder;

    @GetMapping("/api/config")
    public Map<String, String> getConfig() {
        return Map.of("dataFolder", dataFolder);
    }
}