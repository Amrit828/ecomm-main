package com.amrit.productservice.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "products")
public class Product {
    @Id
    private String id;
    private String name;
    private String description;
    private double price;
    private int stock;
    private String sellerId;
    // Stores the product image as a Base64-encoded string (data:image/...;base64,...)
    private String imageBase64;

    @Builder.Default
    private int discount = 0; // percentage 0-100

    @Builder.Default
    private java.util.List<String> tags = new java.util.ArrayList<>();
}
