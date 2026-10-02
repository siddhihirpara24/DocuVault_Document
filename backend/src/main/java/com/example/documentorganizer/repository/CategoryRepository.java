package com.example.documentorganizer.repository;

import com.example.documentorganizer.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {

    Optional<Category> findByName(String name);

    boolean existsByName(String name);

    @Query("SELECT c.id, c.name, c.description, COUNT(d.id) FROM Category c LEFT JOIN c.documents d GROUP BY c.id, c.name, c.description ORDER BY c.name ASC")
    List<Object[]> findAllWithDocumentCounts();
}
