package com.amrit.orderservice.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "orders")
public class Order {
    @Id
    private String id;
    private String userId;
    @Builder.Default
    private List<OrderItem> items = new ArrayList<>();
    private double totalAmount;
    private String shippingAddress;
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
