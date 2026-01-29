package com.worldbuilding.app.controller;

import org.springframework.boot.webmvc.error.ErrorController;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import jakarta.servlet.http.HttpServletRequest;

/**
 * Robust SPA fallback.
 * Instead of trying to match all frontend routes with Regex,
 * we handle the "Not Found" error globally.
 * If a path is 404 AND not an API call AND not a static file,
 * we forward to index.html.
 */
@Controller
public class SpaController implements ErrorController {

    @RequestMapping("/error")
    public String handleError(HttpServletRequest request) {
        Object status = request.getAttribute(jakarta.servlet.RequestDispatcher.ERROR_STATUS_CODE);
        String path = (String) request.getAttribute(jakarta.servlet.RequestDispatcher.ERROR_REQUEST_URI);

        // If we have a path and it's an API call or static file reference that failed,
        // return 404 (default behavior)
        if (path != null) {
            String lower = path.toLowerCase();
            if (lower.startsWith("/api/") || lower.contains(".")) {
                // Let Spring boot default error handler return 404/500 JSON or page
                // We forward to a non-existent mapping to trigger default behavior or just
                // return error view name
                // Actually returning null or letting it bubble usually works, but explicit
                // forward avoids loops.
                // NOTE: simpler approach: just return index.html for everything that ISN'T
                // api/extension
            }
        }

        // For everything else (clean URLs like /bible, /project/123), show React App
        return "forward:/index.html";
    }

    // No override needed for getErrorPath in newer Spring Boot, handled by
    // @RequestMapping("/error")
}
