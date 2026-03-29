package com.amrit.productservice.repository;

import com.amrit.productservice.model.Tag;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface TagRepository extends MongoRepository<Tag, String> {
    boolean existsByName(String name);
}
