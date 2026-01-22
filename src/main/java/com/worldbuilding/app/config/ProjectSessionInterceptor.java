package com.worldbuilding.app.config;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.lang.Nullable;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;
import org.springframework.web.servlet.ModelAndView;

/**
 * Interceptor que sincroniza el proyecto activo de la sesión con el ThreadLocal
 * del DataSource al inicio de cada request.
 */
@Component
public class ProjectSessionInterceptor implements HandlerInterceptor {

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler)
            throws Exception {

        // Skip static resources/error paths if needed (optional)
        String path = request.getRequestURI();
        if (!path.startsWith("/api/")) {
            return true;
        }

        // Single User Mode Adaptation:
        // If no session exists or no project is selected, auto-inject defaults.
        jakarta.servlet.http.HttpSession session = request.getSession(true); // Create session if needed
        if (session.getAttribute("proyectoActivo") == null) {
            session.setAttribute("proyectoActivo", "Default World");
            session.setAttribute("user", "Architect");
            // System.out.println(">>> Auto-Injected Single User Session: Default World");
        }

        String projectName = (String) request.getSession().getAttribute("proyectoActivo");
        if (projectName != null) {
            // System.out.println(">>> Context Set: " + projectName);
            TenantContext.setCurrentTenant(projectName);
        } else {
            TenantContext.clear();
        }

        return true;
    }

    @Override
    public void postHandle(HttpServletRequest request, HttpServletResponse response, Object handler,
            @Nullable ModelAndView modelAndView) throws Exception {
    }

    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler,
            @Nullable Exception ex) throws Exception {
        TenantContext.clear();
    }
}
