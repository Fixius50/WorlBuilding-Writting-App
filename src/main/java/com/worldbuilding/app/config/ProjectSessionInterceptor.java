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

        String path = request.getRequestURI();
        if (!path.startsWith("/api/")) {
            return true;
        }

        // Terse log: [->] METHOD PATH
        logger.info("[->] {} {}", request.getMethod(), path);

        try {
            jakarta.servlet.http.HttpSession session = request.getSession(true);
            String projectName = (String) session.getAttribute("proyectoActivo");

            // NEW: Support header-based context activation for iframes (avoiding cookie
            // issues)
            String headerProject = request.getHeader("X-Project-ID");
            if (headerProject != null && !headerProject.trim().isEmpty()) {
                projectName = headerProject;
            }

            if (projectName != null) {
                TenantContext.setCurrentTenant(projectName);
            } else {
                TenantContext.clear();
            }
        } catch (Exception e) {
            logger.error("!!! [Interceptor Error] {}", e.getMessage());
            throw e;
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
