package com.amrit.orderservice.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderItem {
    private String productId;
    private String productName;
    private String sellerId;
    private int quantity;
    private double price;
    @Builder.Default
    private String status = "PENDING"; // PENDING, SHIPPED, DELIVERED
}
