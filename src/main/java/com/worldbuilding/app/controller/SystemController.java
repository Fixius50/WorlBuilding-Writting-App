package com.worldbuilding.app.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.SpringApplication;
import org.springframework.context.ApplicationContext;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.File;
import java.util.Map;

@RestController
@RequestMapping("/api/system")
public class SystemController {

    @Autowired
    private ApplicationContext context;

    @PostMapping("/restart")
    public ResponseEntity<?> restartServer() {
        new Thread(() -> {
            try {
                // Create restart flag file
                File restartFlag = new File("restart.flag");
                restartFlag.createNewFile();

                Thread.sleep(1000); // Give time for response to be sent
                SpringApplication.exit(context, () -> 0);
                System.exit(0);
            } catch (Exception e) {
                e.printStackTrace();
            }
        }).start();

        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Server shutdown initiated. Will auto-restart if using start-with-autorestart.bat",
                "requiresScript", true));

    }

    @GetMapping("/health")
    public ResponseEntity<?> healthCheck() {
        return ResponseEntity.ok(Map.of(
                "status", "UP",
                "timestamp", System.currentTimeMillis()));
    }
}
