package com.worldbuilding.app.config;

import com.worldbuilding.app.model.*;
import com.worldbuilding.app.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataSeeder implements CommandLineRunner {

    @Autowired
    private UsuarioRepository usuarioRepository;
    @Autowired
    private CuadernoRepository cuadernoRepository;
    @Autowired
    private UniversoRepository universoRepository;
    @Autowired
    private LineaTemporalRepository lineaTemporalRepository;
    @Autowired
    private EventoCronologiaRepository eventoRepository;
    @Autowired
    private HojaRepository hojaRepository;

    @Override
    public void run(String... args) throws Exception {
        System.out.println("SEEDING: Checking for test user...");

        if (usuarioRepository.findByUsername("testuser").isPresent()) {
            System.out.println("SEEDING: testuser already exists. Updating password to 123456.");
            Usuario user = usuarioRepository.findByUsername("testuser").get();
            user.setPassword("123456");
            usuarioRepository.save(user);
        } else {
            System.out.println("SEEDING: Initializing Test Data...");
            Usuario user = new Usuario();
            user.setUsername("testuser");
            user.setPassword("123456");
            user.setEmail("test@chronos.com");
            usuarioRepository.save(user);

            // Create default project if none exists
            Cuaderno proyecto = new Cuaderno();
            proyecto.setNombreProyecto("Proyecto Alpha");
            proyecto.setTitulo("Crónicas del Multiverso");
            proyecto.setDescripcion("Un proyecto de prueba generado automáticamente.");
            proyecto.setUsuario(user);
            cuadernoRepository.save(proyecto);

            // Create default sheet
            Hoja hoja = new Hoja();
            hoja.setCuaderno(proyecto);
            hoja.setNumeroPagina(1);
            hoja.setContenido(
                    "<h3>Capítulo I: El Comienzo</h3><p>La tormenta soplaba fuerte sobre las torres de Mar-Gorth...</p>");
            hojaRepository.save(hoja);
        }

        System.out.println("SEEDING: Complete.");
    }
}
