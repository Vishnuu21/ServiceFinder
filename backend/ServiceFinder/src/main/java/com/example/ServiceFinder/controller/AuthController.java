package com.example.ServiceFinder.controller;

import com.example.ServiceFinder.dto.request.LoginRequest;
import com.example.ServiceFinder.dto.request.RegisterRequest;
import com.example.ServiceFinder.dto.response.AuthResponse;
import com.example.ServiceFinder.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        try {
            AuthResponse response = authService.register(request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            AuthResponse response = authService.login(request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PatchMapping("/profile-picture")
    public ResponseEntity<?> updateProfilePicture(@RequestBody Map<String, String> body, Authentication auth) {
        try {
            return ResponseEntity.ok(authService.updateProfilePicture(auth.getName(), body.get("profilePicture")));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}
