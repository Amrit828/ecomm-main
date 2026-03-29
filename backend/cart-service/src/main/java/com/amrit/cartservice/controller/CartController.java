package com.amrit.cartservice.controller;

import com.amrit.cartservice.model.Cart;
import com.amrit.cartservice.model.CartItem;
import com.amrit.cartservice.service.CartService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("/carts")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

    // Internal endpoint called by auth-service
    @PostMapping("/init/{userId}")
    public ResponseEntity<Void> initCart(@PathVariable String userId) {
        cartService.initCart(userId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/my-cart")
    @PreAuthorize("hasRole('BUYER')")
    public ResponseEntity<Cart> getMyCart() {
        String userId = getAuthenticatedUserId();
        return ResponseEntity.ok(cartService.getCart(userId));
    }

    @PostMapping("/add")
    @PreAuthorize("hasRole('BUYER')")
    public ResponseEntity<Cart> addItem(HttpServletRequest servletRequest, @RequestBody CartItem request) {
        String userId = getAuthenticatedUserId();
        String authHeader = servletRequest.getHeader("Authorization");
        return ResponseEntity.ok(cartService.addItemToCart(userId, authHeader, request.getProductId(), request.getQuantity()));
    }

    @PutMapping("/reduce")
    @PreAuthorize("hasRole('BUYER')")
    public ResponseEntity<Cart> reduceItem(HttpServletRequest servletRequest, @RequestBody CartItem request) {
        String userId = getAuthenticatedUserId();
        String authHeader = servletRequest.getHeader("Authorization");
        return ResponseEntity.ok(cartService.removeItemFromCart(userId, authHeader, request.getProductId(), request.getQuantity()));
    }

    @DeleteMapping("/clear")
    @PreAuthorize("hasRole('BUYER')")
    public ResponseEntity<Void> clearCart() {
        String userId = getAuthenticatedUserId();
        cartService.clearCart(userId);
        return ResponseEntity.noContent().build();
    }

    private String getAuthenticatedUserId() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }
}
