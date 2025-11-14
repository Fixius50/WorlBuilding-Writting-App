package com.worldbuilding.WorldbuildingApp.controladores;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.SpringApplication;
import org.springframework.context.ApplicationContext;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Controlador consolidado que maneja:
 * 1. Navegación entre páginas de la aplicación
 * 2. Configuración de la aplicación
 * 3. Shutdown de la aplicación
 * 
 * Anteriormente dividido en PagesController, ConfigController y ShutdownController
 */

@RestController
public class NavController {

    @Value("${app.data-folder:./data}")
    private String dataFolder;

    // ========== ENDPOINTS DE NAVEGACIÓN ==========

    @GetMapping("/")
    public String menuInicial() {
        return "forward:./menuInicialLog.html";
    }

    @GetMapping("/ventanaProyectos")
    public String ventanaProyectos() {
        return "forward:html/ventanaProyectos.html";
    }

    @GetMapping("/ventanaCreacion")
    public String ventanaCreacion() {
        return "forward:html/ventanaCreacion.html";
    }

    @GetMapping("/ventanaAjustes")
    public String ventanaAjustes() {
        return "forward:html/ventanaAjustes.html";
    }

    // ========== ENDPOINTS DE CONFIGURACIÓN ==========

    @GetMapping("/api/config")
    public Map<String, String> getConfig() {
        return Map.of("dataFolder", dataFolder);
    }

    @Autowired
    private ApplicationContext appContext;

    @PostMapping("/api/exit")
    public void shutdownContext() {
        Thread thread = new Thread(() -> {
            try {
                Thread.sleep(500); // Espera 1 seg para responder bien
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
            SpringApplication.exit(appContext, () -> 0);
        });
        thread.setDaemon(false);
        thread.start();
    }
}