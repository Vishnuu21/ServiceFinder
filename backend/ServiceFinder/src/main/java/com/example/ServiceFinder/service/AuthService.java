package com.example.ServiceFinder.service;

import com.example.ServiceFinder.dto.request.LoginRequest;
import com.example.ServiceFinder.dto.request.RegisterRequest;
import com.example.ServiceFinder.dto.response.AuthResponse;
import com.example.ServiceFinder.entity.User;
import com.example.ServiceFinder.repository.UserRepository;
import com.example.ServiceFinder.security.JwtUtil;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    public AuthResponse register(RegisterRequest request) {
        User.Role role;
        try {
            role = User.Role.valueOf(request.getRole().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid role. Must be CUSTOMER or PROVIDER.");
        }

        if (role == User.Role.SUPER_ADMIN || role == User.Role.ADMIN)
            throw new RuntimeException("Invalid role. Must be CUSTOMER or PROVIDER.");

        if (userRepository.existsByEmail(request.getEmail())) {
            User existing = userRepository.findByEmail(request.getEmail()).get();
            if (!existing.getRole().equals(role)) {
                throw new RuntimeException(
                    "You are already registered as a " + existing.getRole().name() +
                    ". You cannot register as a " + role.name() + "."
                );
            }
            throw new RuntimeException("You already have an account. Please login.");
        }

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(role)
                .build();

        userRepository.save(user);
        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name());
        return new AuthResponse(token, user.getName(), user.getEmail(), user.getRole().name(), null, user.getId());
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("No account found with this email. Please register first."));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Incorrect password. Please try again.");
        }

        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name());
        return new AuthResponse(token, user.getName(), user.getEmail(), user.getRole().name(), user.getProfilePicture(), user.getId());
    }

    public AuthResponse updateProfilePicture(String email, String base64Image) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setProfilePicture(base64Image);
        userRepository.save(user);
        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name());
        return new AuthResponse(token, user.getName(), user.getEmail(), user.getRole().name(), user.getProfilePicture(), user.getId());
    }

    public boolean verifyPassword(String email, String rawPassword) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return passwordEncoder.matches(rawPassword, user.getPassword());
    }

    public AuthResponse getMe(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name());
        return new AuthResponse(token, user.getName(), user.getEmail(), user.getRole().name(), user.getProfilePicture(), user.getId());
    }

    public AuthResponse initSuperAdmin(String name, String email, String password) {
        boolean exists = userRepository.findAll().stream()
                .anyMatch(u -> u.getRole() == User.Role.SUPER_ADMIN);
        if (exists) throw new RuntimeException("Super Admin already exists");
        User user = User.builder()
                .name(name)
                .email(email)
                .password(passwordEncoder.encode(password))
                .role(User.Role.SUPER_ADMIN)
                .build();
        userRepository.save(user);
        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name());
        return new AuthResponse(token, user.getName(), user.getEmail(), user.getRole().name(), null, user.getId());
    }
}
