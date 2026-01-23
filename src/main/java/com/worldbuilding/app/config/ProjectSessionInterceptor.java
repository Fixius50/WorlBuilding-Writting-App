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
    private static final org.slf4j.Logger logger = org.slf4j.LoggerFactory.getLogger(ProjectSessionInterceptor.class);

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
        String current = (String) session.getAttribute("proyectoActivo");

        // Auto-inject or Migrate "Default World" to "Prime World"
        if (current == null || "Default World".equals(current)) {
            if ("Default World".equals(current)) {
                logger.info(">>> [Interceptor] Migrating Session 'Default World' -> 'Prime World'");
            } else {
                logger.info(">>> [Interceptor] Auto-Injecting Session Defaults: Prime World");
            }
            session.setAttribute("proyectoActivo", "Prime World");
            session.setAttribute("user", "Architect");
        } else {
            logger.debug(">>> [Interceptor] Existing Session: " + current);
        }

        String projectName = (String) request.getSession().getAttribute("proyectoActivo");
        if (projectName != null) {
            logger.info(">>> [Interceptor] Setting TenantContext to: " + projectName);
            TenantContext.setCurrentTenant(projectName);
        } else {
            logger.warn(">>> [Interceptor] No project active. Clearing TenantContext.");
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
