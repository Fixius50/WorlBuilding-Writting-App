package com.worldbuilding.app.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardOpenOption;
import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api/logs")
public class LogController {

    @PostMapping("/error")
    public ResponseEntity<?> logError(@RequestBody Map<String, Object> errorData) {
        try {
            String source = (String) errorData.getOrDefault("source", "Frontend");
            String message = (String) errorData.getOrDefault("message", "No message");
            String stack = (String) errorData.getOrDefault("stack", "No stack trace");
            String componentStackTrace = (String) errorData.getOrDefault("componentStack", "");

            StringBuilder logContent = new StringBuilder();
            logContent.append("# ERROR REPORT (").append(source).append(")\n");
            logContent.append("**Timestamp:** ").append(LocalDateTime.now()).append("\n");
            logContent.append("**Message:** ").append(message).append("\n\n");

            logContent.append("## Stack Trace\n");
            logContent.append("```\n").append(stack).append("\n```\n");

            if (!componentStackTrace.isEmpty()) {
                logContent.append("\n## Component Stack\n");
                logContent.append("```\n").append(componentStackTrace).append("\n```");
            }

            Path logPath = Paths.get("Docs", "log_errores.md");
            Files.createDirectories(logPath.getParent());

            // Overwrite mode as requested
            Files.writeString(logPath, logContent.toString(),
                    StandardOpenOption.CREATE,
                    StandardOpenOption.TRUNCATE_EXISTING);

            return ResponseEntity.ok().build();
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("Failed to write log: " + e.getMessage());
        }
    }
}
