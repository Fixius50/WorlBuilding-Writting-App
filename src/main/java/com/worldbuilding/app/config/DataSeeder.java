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

    @Override
    public void run(String... args) throws Exception {
        if (usuarioRepository.count() == 0) {
            System.out.println("SEEDING: Initializing Test Data...");

            // 1. Create User
            Usuario user = new Usuario();
            user.setUsername("testuser");
            user.setPassword("password"); // Plain text for demo
            user.setEmail("test@chronos.com");
            usuarioRepository.save(user);

            // 2. Create Project
            Cuaderno proyecto = new Cuaderno();
            proyecto.setNombreProyecto("Proyecto Alpha");
            proyecto.setTitulo("Crónicas del Multiverso");
            proyecto.setDescripcion("Un proyecto de prueba generado automáticamente.");
            proyecto.setUsuario(user);
            cuadernoRepository.save(proyecto);

            // 3. Create Universe
            Universo universo = new Universo();
            universo.setNombre("Multiverso Principal");
            universo.setCuaderno(proyecto);
            universoRepository.save(universo);

            // 4. Create Timeline A
            LineaTemporal lineaA = new LineaTemporal();
            lineaA.setNombre("Línea Alpha (Original)");
            lineaA.setUniverso(universo);
            lineaTemporalRepository.save(lineaA);

            // 5. Create Events for Line A
            EventoCronologia evt1 = new EventoCronologia();
            evt1.setTitulo("El Big Bang");
            evt1.setDescripcion("El inicio de todo.");
            evt1.setOrdenCronologico(1);
            evt1.setFechaInGame("Era 0");
            evt1.setLineaTemporal(lineaA);
            eventoRepository.save(evt1);

            // 6. Create Timeline B
            LineaTemporal lineaB = new LineaTemporal();
            lineaB.setNombre("Línea Beta (Alternativa)");
            lineaB.setUniverso(universo);
            lineaTemporalRepository.save(lineaB);

            // 7. Create Events for Line B
            EventoCronologia evt2 = new EventoCronologia();
            evt2.setTitulo("La Divergencia");
            evt2.setDescripcion("Donde todo cambió.");
            evt2.setOrdenCronologico(1);
            evt2.setFechaInGame("Era 100");
            evt2.setLineaTemporal(lineaB);
            eventoRepository.save(evt2);

            System.out.println("SEEDING: Complete.");
        }
    }
}
