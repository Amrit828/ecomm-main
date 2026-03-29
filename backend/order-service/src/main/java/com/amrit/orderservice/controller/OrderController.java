package com.amrit.orderservice.controller;

import com.amrit.orderservice.model.Order;
import com.amrit.orderservice.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import java.util.List;

@RestController
@RequestMapping("/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    @PreAuthorize("hasRole('BUYER')")
    public ResponseEntity<Order> placeOrder(HttpServletRequest request, @RequestParam String shippingAddress) {
        String userId = getAuthenticatedUserId();
        String authHeader = request.getHeader("Authorization");
        return ResponseEntity.ok(orderService.placeOrder(userId, authHeader, shippingAddress));
    }

    @GetMapping("/my-orders")
    @PreAuthorize("hasRole('BUYER')")
    public ResponseEntity<List<Order>> getMyOrders() {
        String userId = getAuthenticatedUserId();
        return ResponseEntity.ok(orderService.getUserOrders(userId));
    }

    @GetMapping("/seller")
    @PreAuthorize("hasRole('SELLER')")
    public ResponseEntity<List<Order>> getSellerOrders() {
        String sellerId = getAuthenticatedUserId();
        return ResponseEntity.ok(orderService.getSellerOrders(sellerId));
    }

    @PutMapping("/{orderId}/items/{productId}/status")
    @PreAuthorize("hasRole('SELLER')")
    public ResponseEntity<Order> updateStatus(
            @PathVariable String orderId, 
            @PathVariable String productId, 
            @RequestParam String status) {
        String sellerId = getAuthenticatedUserId();
        return ResponseEntity.ok(orderService.updateOrderItemStatus(orderId, productId, sellerId, status));
    }

    private String getAuthenticatedUserId() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }
}
