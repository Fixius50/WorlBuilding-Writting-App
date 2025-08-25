package com.worldbuilding.WorldbuildingApp;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.lang.NonNull;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@SpringBootApplication
public class WorldbuildingAppApplication {
	/**
	 * Primero arrancar XAMPP e iniciar MySQL
	 * Luego: ejecutar la app y poner en el navegador http://localhost:8080 y de seguido la ruta relativa.
	 */

    public static void main(String[] args) {
        SpringApplication.run(WorldbuildingAppApplication.class, args);
        abrirNavegador("http://localhost:8080/menuInicialLog.html");
    }

    /**
     * corsConfigurer(): esta función se encarga de configurar los CORS (Cross-Origin Resource Sharing de React) para que la aplicación pueda ser accedida desde el frontend.
     */
    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(@NonNull CorsRegistry registry) {
                registry.addMapping("/api/**")
                        .allowedOrigins("http://localhost:8080")
                        .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                        .allowedHeaders("*")
                        .allowCredentials(true);

            }
        };
    }

    /**
     * abrirNavegador(): esta función carga e inicia el navegador. Primero se encarga de comprobar el tipo de sistema operativo
     * con el que se está ejecutando la aplicación, y si es así, lo inicia. En caso contrario, daría error y no se iniciaría.
     * @param url
     */
    public static void abrirNavegador(String url) {
        try {
            String os = System.getProperty("os.name").toLowerCase();

            ProcessBuilder pb;

            if (os.contains("win")) {
                pb = new ProcessBuilder("rundll32", "url.dll,FileProtocolHandler", url);
                pb.start();
            } else if (os.contains("mac")) {
                pb = new ProcessBuilder("open", url);
                pb.start();
            } else if (os.contains("nix") || os.contains("nux") || os.contains("aix") || os.contains("linux")) {
                pb = new ProcessBuilder("xdg-open", url);
                pb.start();
            } else {
                System.err.println("Sistema operativo no soportado para abrir el navegador automáticamente.");
            }

        } catch (Exception e) {
            System.err.println("No se pudo abrir el navegador automáticamente: " + e.getMessage());
        }
    }
}