package com.amrit.productservice.controller;

import com.amrit.productservice.model.Product;
import com.amrit.productservice.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    @GetMapping
    public ResponseEntity<List<Product>> getAllProducts() {
        return ResponseEntity.ok(productService.getAllProducts());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Product> getProduct(@PathVariable String id) {
        return ResponseEntity.ok(productService.getProductById(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('SELLER')")
    public ResponseEntity<Product> addProduct(@RequestBody Product product) {
        String sellerId = getAuthenticatedUserId();
        return ResponseEntity.ok(productService.addProduct(product, sellerId));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('SELLER')")
    public ResponseEntity<Product> updateProduct(@PathVariable String id, @RequestBody Product product) {
        String sellerId = getAuthenticatedUserId();
        return ResponseEntity.ok(productService.updateProduct(id, product, sellerId));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('SELLER')")
    public ResponseEntity<Void> deleteProduct(@PathVariable String id) {
        String sellerId = getAuthenticatedUserId();
        productService.deleteProduct(id, sellerId);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/reduce-stock")
    @PreAuthorize("hasAnyRole('BUYER', 'SELLER')")
    public ResponseEntity<Void> reduceStock(@PathVariable String id, @RequestParam int quantity) {
        productService.reduceStock(id, quantity);
        return ResponseEntity.ok().build();
    }

    private String getAuthenticatedUserId() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }
}
