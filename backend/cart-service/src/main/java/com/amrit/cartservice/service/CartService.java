package com.amrit.cartservice.service;

import com.amrit.cartservice.model.Cart;
import com.amrit.cartservice.model.CartItem;
import com.amrit.cartservice.repository.CartRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.web.client.RestTemplate;
import org.springframework.core.ParameterizedTypeReference;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CartService {

    private final CartRepository cartRepository;
    private final RestTemplate restTemplate;

    @Value("${product.service.url}")
    private String productServiceUrl;

    public void initCart(String userId) {
        if(cartRepository.findByUserId(userId).isEmpty()) {
            Cart cart = Cart.builder().userId(userId).build();
            cartRepository.save(cart);
        }
    }

    public Cart getCart(String userId) {
        return cartRepository.findByUserId(userId)
                .orElseGet(() -> {
                    Cart newCart = Cart.builder().userId(userId).build();
                    return cartRepository.save(newCart);
                });
    }

    public Cart addItemToCart(String userId, String authHeader, String productId, int quantity) {
        // 1. Fetch Product Price & Check Stock natively
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", authHeader);
        HttpEntity<Void> entity = new HttpEntity<>(headers);

        ResponseEntity<Map<String, Object>> productResponse = restTemplate.exchange(
                productServiceUrl + "/products/" + productId,
                HttpMethod.GET,
                entity,
                new ParameterizedTypeReference<Map<String, Object>>() {}
        );

        Map<String, Object> product = productResponse.getBody();
        if (product == null) {
            throw new RuntimeException("Product not found");
        }

        int availableStock = (Integer) product.get("stock");
        if (availableStock < quantity) {
            throw new RuntimeException("Insufficient stock available");
        }

        double rawPrice = ((Number) product.get("price")).doubleValue();
        Object discountObj = product.get("discount");
        double discount = discountObj != null ? ((Number) discountObj).doubleValue() : 0.0;
        double price = discount > 0 ? rawPrice * (1 - discount / 100.0) : rawPrice;
        String productName = (String) product.get("name");

        // 2. Update Cart Document and sum Prices
        Cart cart = getCart(userId);

        Optional<CartItem> existingItem = cart.getItems().stream()
                .filter(item -> item.getProductId().equals(productId))
                .findFirst();

        if (existingItem.isPresent()) {
            existingItem.get().setQuantity(existingItem.get().getQuantity() + quantity);
        } else {
            cart.getItems().add(new CartItem(productId, productName, price, quantity));
        }

        cart.setTotalPrice(cart.getTotalPrice() + (price * quantity));

        return cartRepository.save(cart);
    }

    public Cart removeItemFromCart(String userId, String authHeader, String productId, int quantityToReduce) {
        Cart cart = getCart(userId);
        
        Optional<CartItem> existingItem = cart.getItems().stream()
                .filter(item -> item.getProductId().equals(productId))
                .findFirst();

        if (existingItem.isPresent()) {
            CartItem item = existingItem.get();
            
            // Fetch price to appropriately deduct
            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", authHeader);
            HttpEntity<Void> entity = new HttpEntity<>(headers);

            ResponseEntity<Map<String, Object>> productResponse = restTemplate.exchange(
                    productServiceUrl + "/products/" + productId,
                    HttpMethod.GET,
                    entity,
                    new ParameterizedTypeReference<Map<String, Object>>() {}
            );

            double price = 0;
            if (productResponse.getBody() != null) {
                Map<String, Object> prod = productResponse.getBody();
                double rawPrice = ((Number) prod.get("price")).doubleValue();
                Object discountObj = prod.get("discount");
                double discount = discountObj != null ? ((Number) discountObj).doubleValue() : 0.0;
                price = discount > 0 ? rawPrice * (1 - discount / 100.0) : rawPrice;
            }

            if (item.getQuantity() <= quantityToReduce) {
                cart.setTotalPrice(cart.getTotalPrice() - (price * item.getQuantity()));
                cart.getItems().remove(item);
            } else {
                item.setQuantity(item.getQuantity() - quantityToReduce);
                cart.setTotalPrice(cart.getTotalPrice() - (price * quantityToReduce));
            }
            
            // Prevent negative prices from floating point weirdness
            if (cart.getTotalPrice() < 0) {
                cart.setTotalPrice(0);
            }
        }

        return cartRepository.save(cart);
    }

    public void clearCart(String userId) {
        Cart cart = getCart(userId);
        cart.getItems().clear();
        cartRepository.save(cart);
    }
}
