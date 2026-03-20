package com.worldbuilding.auxserver;

import org.eclipse.jetty.server.Server;
import org.eclipse.jetty.servlet.ServletContextHandler;
import org.eclipse.jetty.servlet.ServletHolder;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.context.ContextLoaderListener;
import org.springframework.web.context.support.AnnotationConfigWebApplicationContext;
import org.springframework.web.servlet.DispatcherServlet;
import org.springframework.web.servlet.config.annotation.EnableWebMvc;

@Configuration
@ComponentScan(basePackages = "com.worldbuilding.auxserver")
@EnableWebMvc
public class AuxServerApplication {

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

        // Configurar el DispatcherServlet de Spring MVC
        ServletHolder servletHolder = new ServletHolder(new DispatcherServlet(context));
        handler.addServlet(servletHolder, "/*");

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
