package com.amrit.authservice.controller;


import com.amrit.authservice.dto.AuthResponse;
import com.amrit.authservice.dto.LoginRequest;
import com.amrit.authservice.dto.RegisterRequest;
import com.amrit.authservice.service.AuthService;
import lombok.RequiredArgsConstructor;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import java.util.Map;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public AuthResponse register(@Valid @RequestBody RegisterRequest request){
        return authService.register(request);
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest request){
        return authService.login(request);
    }

    @GetMapping("/test")
    public String test() {
        return "SUCCESS! If you are seeing this, your JWT token is valid and the JwtFilter is working perfectly!";
    }

    @GetMapping("/buyer-only")
    @PreAuthorize("hasRole('BUYER')")
    public String buyerOnly() {
        return "Welcome Buyer! You have access to the Order and Cart services.";
    }

    @GetMapping("/seller-only")
    @PreAuthorize("hasRole('SELLER')")
    public String sellerOnly() {
        return "Welcome Seller! You have access to the Product service.";
    }

    @GetMapping("/anyone")
    @PreAuthorize("hasAnyRole('BUYER', 'SELLER')")
    public String anyone() {
        return "Welcome! Both Buyers and Sellers can see this endpoint.";
    }

    @GetMapping("/validate")
    public ResponseEntity<Map<String, String>> validateToken() {
        var authentication = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getName() == null) {
            return ResponseEntity.status(401).build();
        }
        
        String userId = authentication.getName();
        String role = authentication.getAuthorities().stream()
                .findFirst()
                .map(grantedAuthority -> grantedAuthority.getAuthority().replace("ROLE_", ""))
                .orElse("BUYER");

        return ResponseEntity.ok(Map.of("userId", userId, "role", role));
    }
}
