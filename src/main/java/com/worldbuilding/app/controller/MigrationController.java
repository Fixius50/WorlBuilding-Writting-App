package com.worldbuilding.app.controller;

import com.worldbuilding.app.service.MigrationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/migration")
public class MigrationController {

    @Autowired
    private MigrationService migrationService;

    @PostMapping("/run")
    public ResponseEntity<?> runMigration() {
        try {
            migrationService.runFullMigration();
            return ResponseEntity.ok(Map.of("success", true, "message", "Migration executed successfully."));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }
}
