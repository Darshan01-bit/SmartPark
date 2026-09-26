package com.SmartPark.controller;

import com.SmartPark.entity.User;
import com.SmartPark.repository.UserRepository;
import com.SmartPark.security.JwtService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;


@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:5173")
public class UserController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public UserController(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService) {

        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {

        if (userRepository
                .findByEmail(user.getEmail())
                .isPresent()) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            Map.of(
                                    "message",
                                    "Email already registered"
                            )
                    );
        }

        user.setPassword(
                passwordEncoder.encode(
                        user.getPassword()
                )
        );

        if (user.getRole() == null ||
                user.getRole().isBlank()) {

            user.setRole("USER");
        }

        User savedUser =
                userRepository.save(user);

        return ResponseEntity.ok(
                Map.of(
                        "message",
                        "Registration successful",

                        "userId",
                        savedUser.getId(),

                        "name",
                        savedUser.getName(),

                        "email",
                        savedUser.getEmail(),

                        "role",
                        savedUser.getRole()
                )
        );
    }

    @PostMapping("/login")
        public ResponseEntity<?> login(@RequestBody User loginUser) {

        User user = userRepository
                .findByEmail(loginUser.getEmail())
                .orElse(null);

        if (user == null) {
                return ResponseEntity
                        .status(401)
                        .body(Map.of(
                                "message",
                                "Invalid email or password"
                        ));
        }

        if (!passwordEncoder.matches(
                loginUser.getPassword(),
                user.getPassword())) {

                return ResponseEntity
                        .status(401)
                        .body(Map.of(
                                "message",
                                "Invalid email or password"
                        ));
        }

        String role = user.getRole();

        if (role == null || role.isBlank()) {
                role = "USER";
        }

        String token = jwtService.generateToken(
                user.getEmail(),
                role
        );

        return ResponseEntity.ok(
                Map.of(
                        "message", "Login successful",
                        "userId", user.getId(),
                        "name", user.getName(),
                        "email", user.getEmail(),
                        "role", role,
                        "token", token
                )
        );
        }
}