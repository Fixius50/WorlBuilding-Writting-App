package com.worldbuilding.app.config;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
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
        // La lógica de DynamicDataSource ya no es necesaria con SQLite (base de datos
        // única)
        // Mantenemos el interceptor por si necesitamos lógica de sesión futura
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
        // DynamicDataSourceConfig.clearCurrentProject();
    }
}
