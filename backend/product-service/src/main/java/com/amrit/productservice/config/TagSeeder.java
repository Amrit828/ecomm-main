package com.amrit.productservice.config;

import com.amrit.productservice.model.Tag;
import com.amrit.productservice.repository.TagRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class TagSeeder implements CommandLineRunner {

    private final TagRepository tagRepository;

    private static final List<String> DEFAULT_TAGS = List.of(
        "Electronics", "Fashion", "Books", "Home & Living",
        "Sports", "Kitchen", "Beauty", "Toys",
        "Automotive", "Garden"
    );

    @Override
    public void run(String... args) {
        for (String name : DEFAULT_TAGS) {
            if (!tagRepository.existsByName(name)) {
                tagRepository.save(Tag.builder().name(name).build());
            }
        }
    }
}
