package com.worldbuilding.app.exception;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import jakarta.servlet.http.HttpServletRequest;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger logger = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleAllExceptions(Exception ex, HttpServletRequest request) {
        HttpStatus status = HttpStatus.INTERNAL_SERVER_ERROR;

        // Check for @ResponseStatus annotation on the exception class
        ResponseStatus responseStatus = ex.getClass().getAnnotation(ResponseStatus.class);
        if (responseStatus != null) {
            status = responseStatus.value();
        }

        Map<String, Object> response = new HashMap<>();
        response.put("status", status.value());
        response.put("path", request.getMethod() + " " + request.getRequestURI());

        // Minimal log for terminal: STATUS METHOD PATH
        logger.error("!!! [ERR] {} {} {}", status.value(), request.getMethod(), request.getRequestURI());

        // We can still log the stack trace at debug level if needed,
        // but for now we keep it ultra-clean as requested.
        if (status == HttpStatus.INTERNAL_SERVER_ERROR) {
            logger.debug("Stack trace: ", ex);
        }

        return ResponseEntity.status(status).body(response);
    }
}
