package com.amrit.productservice.service;

import com.amrit.productservice.model.Product;
import com.amrit.productservice.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;

    public Product addProduct(Product product, String sellerId) {
        product.setSellerId(sellerId);
        return productRepository.save(product);
    }

    public Product updateProduct(String id, Product updatedProduct, String sellerId) {
        Product existing = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        
        if (!existing.getSellerId().equals(sellerId)) {
            throw new RuntimeException("Unauthorized: You do not own this product");
        }

        existing.setName(updatedProduct.getName());
        existing.setDescription(updatedProduct.getDescription());
        existing.setPrice(updatedProduct.getPrice());
        existing.setStock(updatedProduct.getStock());
        existing.setDiscount(updatedProduct.getDiscount());
        existing.setTags(updatedProduct.getTags());
        if (updatedProduct.getImageBase64() != null) {
            existing.setImageBase64(updatedProduct.getImageBase64());
        }
        return productRepository.save(existing);
    }

    public void deleteProduct(String id, String sellerId) {
        Product existing = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        if (!existing.getSellerId().equals(sellerId)) {
            throw new RuntimeException("Unauthorized: You do not own this product");
        }
        productRepository.deleteById(id);
    }

    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    public Product getProductById(String id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));
    }

    public void reduceStock(String id, int quantity) {
        Product existing = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        
        if (existing.getStock() < quantity) {
            throw new RuntimeException("Insufficient stock");
        }

        existing.setStock(existing.getStock() - quantity);
        productRepository.save(existing);
    }
}
