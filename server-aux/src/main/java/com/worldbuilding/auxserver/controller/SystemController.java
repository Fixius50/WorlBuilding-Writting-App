package com.worldbuilding.auxserver.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

/**
 * Controlador REST para servicios del sistema.
 */
@RestController
@RequestMapping("/api/system")
public class SystemController {

    @GetMapping("/status")
    public Map<String, Object> getStatus() {
        Map<String, Object> status = new HashMap<>();
        status.put("active", true);
        status.put("version", "1.0.0-AUX");
        status.put("runtime", "Java " + Runtime.version().toString());
        status.put("framework", "Spring 4.3.30");
        return status;
    }

    @GetMapping("/ping")
    public String ping() {
        return "pong";
    }
}
