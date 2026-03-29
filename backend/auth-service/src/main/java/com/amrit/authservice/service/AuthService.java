package com.amrit.authservice.service;

import com.amrit.authservice.dto.RegisterRequest;
import com.amrit.authservice.dto.LoginRequest;
import com.amrit.authservice.dto.AuthResponse;
import com.amrit.authservice.model.User;
import com.amrit.authservice.repository.UserRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final RestTemplate restTemplate;

    @Value("${cart.service.url}")
    private String cartServiceUrl;

    public AuthResponse register(RegisterRequest request) {

        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already exists");
        }

        User user = User.builder()
                .userId(UUID.randomUUID().toString())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .address(request.getAddress())
                .phoneNo(request.getPhoneNo())
                .role(request.getRole() != null ? request.getRole() : "BUYER")
                .build();

        userRepository.save(user);

        // Ping Cart Service immediately to reserve a cart synchronously safely
        try {
            restTemplate.postForEntity(cartServiceUrl + "/carts/init/" + user.getUserId(), null, Void.class);
        } catch(Exception e) {
            System.err.println("Warning: Failed to initialize cart for user " + user.getUserId() + ". Cart service may be down.");
        }

        String token = jwtService.generateToken(user.getUserId(), user.getRole());

        return new AuthResponse(token);
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid password");
        }

        String token = jwtService.generateToken(user.getUserId(), user.getRole());
        return new AuthResponse(token);
    }
}
