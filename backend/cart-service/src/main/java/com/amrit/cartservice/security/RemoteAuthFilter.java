package com.amrit.cartservice.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class RemoteAuthFilter extends OncePerRequestFilter {

    private final RestTemplate restTemplate;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        final String authHeader = request.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", authHeader);
            HttpEntity<String> entity = new HttpEntity<>(headers);

            ResponseEntity<Map<String, String>> res = restTemplate.exchange(
                    "http://localhost:8081/auth/validate",
                    HttpMethod.GET,
                    entity,
                    new ParameterizedTypeReference<Map<String, String>>() {}
            );

            if (res.getStatusCode().is2xxSuccessful() && res.getBody() != null) {
                String userId = res.getBody().get("userId");
                String role = res.getBody().get("role");

                if (userId != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                    String assignedRole = role != null ? role : "BUYER";
                    var authorities = Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + assignedRole));
                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            userId,
                            null,
                            authorities
                    );
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                }
            }
        } catch (Exception e) {
            // Token invalid or auth service down
        }

        filterChain.doFilter(request, response);
    }
}
