package com.worldbuilding.WorldbuildingApp.controladores;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.SpringApplication;
import org.springframework.context.ApplicationContext;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Esta clase lo que hace es preparar el cierre de la aplicación y cerrarlo al cabo de un tiempo.
 */

@RestController
public class ShutdownController {

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