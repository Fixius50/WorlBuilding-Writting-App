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

    private static long lastHeartbeat = 0;
    private static boolean heartbeatReceived = false;
    private static final long STARTUP_TIME = System.currentTimeMillis();

    // Config: Shutdown if no heartbeat for 5 seconds
    private static final long TIMEOUT_MS = 5000;
    // Config: Initial grace period of 60 seconds (allow user to open browser)
    private static final long INITIAL_GRACE_PERIOD_MS = 60000;

    @jakarta.annotation.PostConstruct
    public void init() {
        startHeartbeatMonitor();
    }

    @PostMapping("/heartbeat")
    public ResponseEntity<?> heartbeat() {
        lastHeartbeat = System.currentTimeMillis();
        heartbeatReceived = true;
        return ResponseEntity.ok().build();
    }

    private void startHeartbeatMonitor() {
        Thread monitorParams = new Thread(() -> {
            System.out.println(">>> Heartbeat monitor started. Timeout: " + TIMEOUT_MS + "ms");
            try {
                while (true) {
                    long now = System.currentTimeMillis();
                    long uptime = now - STARTUP_TIME;

                    if (heartbeatReceived) {
                        // If we have received at least one heartbeat, strict timeout applies
                        if (now - lastHeartbeat > TIMEOUT_MS) {
                            System.out.println(">>> Connection lost (last heartbeat " + (now - lastHeartbeat)
                                    + "ms ago). Shutting down.");
                            System.exit(0);
                        }
                    } else {
                        // If no heartbeat yet, respect grace period
                        if (uptime > INITIAL_GRACE_PERIOD_MS) {
                            System.out.println(">>> No client connected within grace period (" + INITIAL_GRACE_PERIOD_MS
                                    + "ms). Shutting down.");
                            System.exit(0);
                        }
                    }
                    Thread.sleep(1000); // Check every second
                }
            } catch (InterruptedException e) {
                // Ignore
            }
        });
        monitorParams.setDaemon(true);
        monitorParams.start();
    }

    @GetMapping("/health")
    public ResponseEntity<?> healthCheck() {
        return ResponseEntity.ok(Map.of(
                "status", "UP",
                "timestamp", System.currentTimeMillis()));
    }
}
