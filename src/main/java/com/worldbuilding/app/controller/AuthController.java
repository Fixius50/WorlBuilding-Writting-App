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

        usuarioRepository.save(nuevoUsuario);

        // Provision User Database
        try {
            provisionUserDatabase(nuevoUsuario.getId());
        } catch (java.io.IOException e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Error creating user workspace: " + e.getMessage()));
        }

        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Usuario creado exitosamente"));
    }

    private void provisionUserDatabase(Long userId) throws java.io.IOException {
        java.nio.file.Path source = java.nio.file.Paths.get("src/main/resources/data/worldbuilding.db");
        java.nio.file.Path targetDir = java.nio.file.Paths.get("src/main/resources/data/users");

        if (!java.nio.file.Files.exists(targetDir)) {
            java.nio.file.Files.createDirectories(targetDir);
        }

        java.nio.file.Path target = targetDir.resolve("user_" + userId + ".db");
        java.nio.file.Files.copy(source, target, java.nio.file.StandardCopyOption.REPLACE_EXISTING);
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
