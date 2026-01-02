package com.worldbuilding.app.controller;

import com.worldbuilding.app.model.Usuario;
import com.worldbuilding.app.repository.UsuarioRepository;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    @Autowired
    private com.worldbuilding.app.repository.CuadernoRepository cuadernoRepository;

    @Autowired
    private com.worldbuilding.app.service.WorldBibleService worldBibleService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials, HttpSession session) {
        String username = credentials.get("username");
        String password = credentials.get("password");

        if (username == null || password == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Usuario y contraseña requeridos"));
        }

        Optional<Usuario> userOpt = usuarioRepository.findByUsername(username)
                .filter(u -> passwordEncoder.matches(password, u.getPassword()));

        if (userOpt.isPresent()) {
            Usuario user = userOpt.get();
            session.setAttribute("user", user);

            // Auto-select first project if available
            java.util.List<com.worldbuilding.app.model.Cuaderno> projects = cuadernoRepository
                    .findByUsuarioId(user.getId());
            if (!projects.isEmpty()) {
                session.setAttribute("proyectoActivo", projects.get(0).getNombreProyecto());
            }

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "username", user.getUsername(),
                    "email", user.getEmail()));
        } else {
            return ResponseEntity.status(401).body(Map.of("error", "Credenciales inválidas"));
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> userData) {
        String username = userData.get("username");
        String password = userData.get("password");
        String email = userData.get("email");

        if (username == null || password == null || email == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Todos los campos son obligatorios"));
        }

        if (usuarioRepository.findByUsername(username).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("error", "El nombre de usuario ya está en uso"));
        }

        if (usuarioRepository.findByEmail(email).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("error", "El email ya está registrado"));
        }

        Usuario nuevoUsuario = new Usuario();
        nuevoUsuario.setUsername(username);
        nuevoUsuario.setPassword(passwordEncoder.encode(password));
        nuevoUsuario.setEmail(email);

        Usuario savedUser = usuarioRepository.save(nuevoUsuario);

        // Initialize User Workspace (Default Project)
        try {
            initializeUserWorkspace(savedUser);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Error initializing workspace: " + e.getMessage()));
        }

        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Usuario creado exitosamente"));
    }

    private void initializeUserWorkspace(Usuario user) {
        // 1. Create Default Project
        com.worldbuilding.app.model.Cuaderno defaultProject = new com.worldbuilding.app.model.Cuaderno();
        // Unique project name to avoid collisions if simple names are used globally,
        // though front-end routing uses /username/projectname, query might be loose.
        // Using "genesis" as a standard slug.
        defaultProject.setNombreProyecto("genesis");
        defaultProject.setTitulo("New Project");
        defaultProject.setUsuarioId(user.getId());
        defaultProject.setDescripcion("Your first world awaits.");
        defaultProject.setTipo("General");
        defaultProject.setGenero("Fantasy");

        com.worldbuilding.app.model.Cuaderno savedProject = cuadernoRepository.save(defaultProject);

        // 2. Create Root Folders
        worldBibleService.createFolder("Characters", savedProject, null);
        worldBibleService.createFolder("Locations", savedProject, null);
        worldBibleService.createFolder("Timeline", savedProject, null);
        worldBibleService.createFolder("Lore", savedProject, null);
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpSession session) {
        session.invalidate();
        return ResponseEntity.ok(Map.of("success", true));
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(HttpSession session) {
        Usuario user = (Usuario) session.getAttribute("user");
        if (user != null) {
            return ResponseEntity.ok(Map.of(
                    "authenticated", true,
                    "username", user.getUsername()));
        } else {
            return ResponseEntity.ok(Map.of("authenticated", false));
        }
    }
}
