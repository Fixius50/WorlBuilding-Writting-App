package com.worldbuilding.app.controller;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session != null) {
            session.invalidate();
        }
        return ResponseEntity.ok(Map.of("success", true, "message", "Logged out successfully"));
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(HttpSession session) {
        // For now, we return a mock user or the active project context
        // In this local-first app, "User" is the machine user.
        String activeProject = (String) session.getAttribute("proyectoActivo");

        return ResponseEntity.ok(Map.of(
                "authenticated", true,
                "username", "Writer",
                "roles", new String[] { "ARCHITECT" },
                "activeProject", activeProject != null ? activeProject : "None"));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials, HttpSession session) {
        // Simple mock login for now since we don't have a DB of users yet (Local App)
        session.setAttribute("user", "Writer");
        return ResponseEntity.ok(Map.of("success", true, "username", "Writer"));
    }
}
