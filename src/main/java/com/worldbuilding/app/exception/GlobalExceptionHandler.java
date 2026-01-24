package com.worldbuilding.app.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import jakarta.servlet.http.HttpServletRequest;

@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(Exception.class)
    public ResponseEntity<?> handleGlobalException(Exception ex, HttpServletRequest request) {
        System.out.println(">>> [GlobalExceptionHandler] EXCEPTION CAUGHT: " + ex.getClass().getName());
        ex.printStackTrace(); // Keep stdout for dev

        try {
            // Write full stack trace to Docs/log_errores.md (Overwrite)
            java.io.StringWriter sw = new java.io.StringWriter();
            java.io.PrintWriter pw = new java.io.PrintWriter(sw);
            ex.printStackTrace(pw);

            String logContent = "# ERROR REPORT (Backend)\n" +
                    "**Timestamp:** " + java.time.LocalDateTime.now() + "\n" +
                    "**Request:** " + request.getMethod() + " " + request.getRequestURI() + "\n" +
                    "**Exception:** " + ex.getClass().getName() + "\n" +
                    "**Message:** " + ex.getMessage() + "\n\n" +
                    "## Stack Trace\n" +
                    "```java\n" + sw.toString() + "\n```";

            java.nio.file.Path logPath = java.nio.file.Paths.get("Docs", "log_errores.md");
            // Ensure parent dir exists
            java.nio.file.Files.createDirectories(logPath.getParent());
            // Overwrite file
            java.nio.file.Files.writeString(logPath, logContent,
                    java.nio.file.StandardOpenOption.CREATE,
                    java.nio.file.StandardOpenOption.TRUNCATE_EXISTING);

        } catch (java.io.IOException ioEx) {
            System.err.println("FAILED TO WRITE ERROR LOG: " + ioEx.getMessage());
        }

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Internal Server Error: " + ex.getMessage());
    }
}
