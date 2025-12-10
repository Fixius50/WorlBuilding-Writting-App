package com.worldbuilding.app.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Configuración de MVC para registrar interceptors.
 */
@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    @Autowired
    private ProjectSessionInterceptor projectSessionInterceptor;

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        // Aplicar a todas las rutas de API
        registry.addInterceptor(projectSessionInterceptor)
                .addPathPatterns("/api/**");
    }
}
