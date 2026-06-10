package com.worldbuilding.core;
 
import org.eclipse.jetty.server.Server;
import org.eclipse.jetty.servlet.ServletContextHandler;
import org.eclipse.jetty.servlet.ServletHolder;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Bean;
import org.springframework.web.multipart.MultipartResolver;
import org.springframework.web.multipart.support.StandardServletMultipartResolver;
 
import javax.servlet.*;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.MultipartConfigElement;
import java.io.File;
import java.io.IOException;
import org.eclipse.jetty.servlet.FilterHolder;
import org.springframework.web.context.ContextLoaderListener;
import org.springframework.web.context.support.AnnotationConfigWebApplicationContext;
import org.springframework.web.servlet.DispatcherServlet;
import org.springframework.web.servlet.config.annotation.EnableWebMvc;
import java.util.EnumSet;
 
@Configuration
@ComponentScan(basePackages = {"com.worldbuilding.core", "com.worldbuilding.domains"})
@EnableWebMvc
public class AuxServerApplication {
 
    @Bean(name = "multipartResolver")
    public MultipartResolver multipartResolver() {
        return new StandardServletMultipartResolver();
    }
 
    public static void main(String[] args) throws Exception {
        int port = 8080;
        System.out.println("--- Starting WorldbuildingAuxServer (Spring v4 + Java 21) on port " + port + " ---");
 
        Server server = new Server(port);
 
        // Configurar el contexto de Spring Web
        AnnotationConfigWebApplicationContext context = new AnnotationConfigWebApplicationContext();
        context.register(AuxServerApplication.class);
 
        ServletContextHandler handler = new ServletContextHandler(ServletContextHandler.SESSIONS);
        handler.setContextPath("/");
        
        // Agregar el listener de Spring
        handler.addEventListener(new ContextLoaderListener(context));
 
        // Obtener ruta absoluta para la carpeta dist
        String distPath = new File("./dist").getAbsolutePath();
        System.out.println("Serving static content from: " + distPath);
 
        // 1. Configurar el DispatcherServlet de Spring MVC para los endpoints de API
        ServletHolder servletHolder = new ServletHolder(new DispatcherServlet(context));
        handler.addServlet(servletHolder, "/api/*");
 
        // Habilitar la subida de archivos multipart en Jetty para este servlet (límite de 500MB)
        MultipartConfigElement multipartConfigElement = new MultipartConfigElement(
                "",
                1024L * 1024L * 500L, // maxFileSize: 500MB
                1024L * 1024L * 1000L, // maxRequestSize: 1000MB (1GB)
                1024 * 1024 * 100 // fileSizeThreshold: 100MB
        );
        servletHolder.getRegistration().setMultipartConfig(multipartConfigElement);

        // 2. Servidor de archivos estáticos (Vite dist) mediante DefaultServlet
        ServletHolder defaultServlet = new ServletHolder("default", org.eclipse.jetty.servlet.DefaultServlet.class);
        defaultServlet.setInitParameter("resourceBase", distPath);
        defaultServlet.setInitParameter("dirAllowed", "false");
        defaultServlet.setInitParameter("welcomeServlets", "true");
        defaultServlet.setInitParameter("redirectWelcome", "false");
        handler.addServlet(defaultServlet, "/");

        // 3. Añadir Cabeceras de Seguridad y Control de Caché
        handler.addFilter(new FilterHolder(new Filter() {
            @Override public void init(FilterConfig filterConfig) throws ServletException {}
            @Override public void destroy() {}
            @Override
            public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) throws IOException, ServletException {
                HttpServletResponse res = (HttpServletResponse) response;
                
                // Cabeceras de aislamiento (Críticas para SQLite WASM)
                res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
                res.setHeader("Cross-Origin-Embedder-Policy", "credentialless");
                
                // Evitar caché en desarrollo/lanzamiento para asegurar carga de bundles nuevos
                res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");
                res.setHeader("Pragma", "no-cache");
                
                // Tipos MIME y Headers de Seguridad adicionales
                res.setHeader("X-Content-Type-Options", "nosniff");
                
                String uri = ((javax.servlet.http.HttpServletRequest)request).getRequestURI();
                if (uri != null) {
                    if (uri.endsWith(".wasm")) res.setContentType("application/wasm");
                }
                
                chain.doFilter(request, response);

                // SPA Fallback: Si no se encuentra el recurso y no es la API, servir index.html
                if (res.getStatus() == 404 && uri != null && !uri.startsWith("/api/")) {
                    res.setStatus(200);
                    res.setContentType("text/html");
                    request.getRequestDispatcher("/index.html").forward(request, response);
                }
            }
        }), "/*", EnumSet.of(DispatcherType.REQUEST));

        server.setHandler(handler);

        try {
            server.start();
            System.out.println("Server started at http://localhost:" + port);
            server.join();
        } catch (Exception e) {
            System.err.println("Failed to start server: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
