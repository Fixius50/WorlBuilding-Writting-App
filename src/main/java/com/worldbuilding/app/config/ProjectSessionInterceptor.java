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
        // Ignorar rutas de auth y recursos estáticos (si aplica)
        String path = request.getRequestURI();
        // Excluir específicamente los endpoints de autenticación para permitir login y
        // registro
        if (path.startsWith("/api/auth/") || !path.startsWith("/api/")) {
            return true;
        }

        Object user = request.getSession().getAttribute("user");
        if (user == null) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().write("{\"error\": \"No autorizado - Sesión requerida\"}");
            return false;
        }
        return true;
    }

    @Override
    public void postHandle(HttpServletRequest request, HttpServletResponse response, Object handler,
            @Nullable ModelAndView modelAndView) throws Exception {
        // No hacer nada
    }

    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler,
            @Nullable Exception ex)
            throws Exception {
        // Limpiar el ThreadLocal al finalizar el request
        // DynamicDataSourceConfig.clearCurrentProject();
    }
}
