package com.worldbuilding.app.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class MainController {

    @org.springframework.web.bind.annotation.ResponseBody
    @GetMapping("/api/debug/inspect")
    public java.util.Map<String, Object> inspect(jakarta.servlet.http.HttpSession session) {
        // Dynamic inspection
        String tenant = com.worldbuilding.app.config.TenantContext.getCurrentTenant();
        String sessionProject = (String) session.getAttribute("proyectoActivo");

        if (sessionProject == null) {
            return java.util.Map.of("status", "NO_SESSION_PROJECT", "tenant", String.valueOf(tenant));
        }

        // We can't easily query the repo if context isn't set, so we rely on what's
        // active
        return java.util.Map.of(
                "tenant", tenant != null ? tenant : "NULL",
                "sessionProject", sessionProject,
                "status", "ACTIVE");
    }
}
