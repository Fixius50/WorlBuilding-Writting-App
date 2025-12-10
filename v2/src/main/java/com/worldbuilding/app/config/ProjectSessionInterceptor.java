package com.worldbuilding.app.config;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;
import org.springframework.web.servlet.ModelAndView;

/**
 * Interceptor que sincroniza el proyecto activo de la sesión con el ThreadLocal
 * del DataSource al inicio de cada request.
 */
@Component
public class ProjectSessionInterceptor implements HandlerInterceptor {

    private static final String PROYECTO_ACTIVO = "proyectoActivo";

    @Autowired
    private DynamicDataSourceConfig dataSourceConfig;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler)
            throws Exception {
        HttpSession session = request.getSession(false);

        if (session != null) {
            String proyectoActivo = (String) session.getAttribute(PROYECTO_ACTIVO);
            if (proyectoActivo != null && !proyectoActivo.isBlank()) {
                // Asegurar que el DataSource del proyecto está registrado y activo
                dataSourceConfig.switchToProject(proyectoActivo);
            }
        }

        return true;
    }

    @Override
    public void postHandle(HttpServletRequest request, HttpServletResponse response, Object handler,
            ModelAndView modelAndView) throws Exception {
        // No hacer nada
    }

    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex)
            throws Exception {
        // Limpiar el ThreadLocal al finalizar el request
        DynamicDataSourceConfig.clearCurrentProject();
    }
}
