package com.amrit.orderservice.service;

import com.amrit.orderservice.model.Order;
import com.amrit.orderservice.model.OrderItem;
import com.amrit.orderservice.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.core.ParameterizedTypeReference;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@SuppressWarnings("unchecked")
public class OrderService {

    private final OrderRepository orderRepository;
    private final RestTemplate restTemplate;

    @Value("${product.service.url}")
    private String productServiceUrl;

    @Value("${cart.service.url}")
    private String cartServiceUrl;

    public Order placeOrder(String userId, String authHeader, String shippingAddress) {
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", authHeader);
        HttpEntity<Void> entity = new HttpEntity<>(headers);

        // 1. Fetch Cart Data
        ResponseEntity<Map<String, Object>> cartResponse = restTemplate.exchange(
                cartServiceUrl + "/carts/my-cart",
                HttpMethod.GET,
                entity,
                new ParameterizedTypeReference<Map<String, Object>>() {}
        );

        Map<String, Object> cart = cartResponse.getBody();
        if (cart == null || !cart.containsKey("items")) {
            throw new RuntimeException("Failed to fetch cart");
        }

        List<Map<String, Object>> cartItems = (List<Map<String, Object>>) cart.get("items");
        if (cartItems.isEmpty()) {
            throw new RuntimeException("Cannot place order with an empty cart");
        }

        // 2. Fetch Prices securely & Build Order Items
        List<OrderItem> orderItems = new ArrayList<>();
        double totalAmount = 0.0;

        for (Map<String, Object> item : cartItems) {
            String productId = (String) item.get("productId");
            int quantity = (Integer) item.get("quantity");

            try {
                ResponseEntity<Map<String, Object>> productResponse = restTemplate.exchange(
                        productServiceUrl + "/products/" + productId,
                        HttpMethod.GET,
                        null,
                        new ParameterizedTypeReference<Map<String, Object>>() {}
                );

                Map<String, Object> product = productResponse.getBody();
                if (product != null) {
                    double rawPrice = ((Number) product.get("price")).doubleValue();
                    Object discountObj = product.get("discount");
                    double discount = discountObj != null ? ((Number) discountObj).doubleValue() : 0.0;
                    double price = discount > 0 ? rawPrice * (1 - discount / 100.0) : rawPrice;
                    String sellerId = (String) product.get("sellerId");

                    String productName = (String) product.get("name");

                    OrderItem orderItem = OrderItem.builder()
                            .productId(productId)
                            .productName(productName)
                            .sellerId(sellerId)
                            .quantity(quantity)
                            .price(price)
                            .build();

                    orderItems.add(orderItem);
                    totalAmount += price * quantity;

                    // Reduce stock natively upon final checkout
                    restTemplate.exchange(
                            productServiceUrl + "/products/" + productId + "/reduce-stock?quantity=" + quantity,
                            HttpMethod.PUT,
                            entity,
                            Void.class
                    );
                }
            } catch(Exception e) {
                System.err.println("Warning: Product " + productId + " could not be resolved.");
            }
        }

        if (orderItems.isEmpty()) {
            throw new RuntimeException("Order aborted: No valid items resolvable in cart.");
        }

        // 3. Save Master Order
        Order order = Order.builder()
                .userId(userId)
                .items(orderItems)
                .totalAmount(totalAmount)
                .shippingAddress(shippingAddress)
                .build();
        
        Order savedOrder = orderRepository.save(order);

        // 4. Securely flush User Cart
        restTemplate.exchange(
                cartServiceUrl + "/carts/clear",
                HttpMethod.DELETE,
                entity,
                Void.class
        );

        return savedOrder;
    }

    public List<Order> getUserOrders(String userId) {
        return orderRepository.findByUserId(userId);
    }

    public List<Order> getSellerOrders(String sellerId) {
        return orderRepository.findByItemsSellerId(sellerId);
    }

    public Order updateOrderItemStatus(String orderId, String productId, String sellerId, String newStatus) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found or invalid"));

        boolean updated = false;
        for (OrderItem item : order.getItems()) {
            if (item.getProductId().equals(productId) && item.getSellerId().equals(sellerId)) {
                item.setStatus(newStatus);
                updated = true;
            }
        }

        if (!updated) {
            throw new RuntimeException("Unauthorized: Seller does not own this specific item in the Order");
        }

        return orderRepository.save(order);
    }
}
