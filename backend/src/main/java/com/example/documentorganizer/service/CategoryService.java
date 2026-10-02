package com.example.documentorganizer.service;

import com.example.documentorganizer.dto.CategoryRequest;
import com.example.documentorganizer.dto.CategoryResponse;
import com.example.documentorganizer.dto.DocumentResponse;
import com.example.documentorganizer.entity.Category;
import com.example.documentorganizer.entity.Document;
import com.example.documentorganizer.exception.BadRequestException;
import com.example.documentorganizer.exception.ResourceNotFoundException;
import com.example.documentorganizer.repository.CategoryRepository;
import com.example.documentorganizer.repository.DocumentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final DocumentRepository documentRepository;

    public CategoryService(CategoryRepository categoryRepository, DocumentRepository documentRepository) {
        this.categoryRepository = categoryRepository;
        this.documentRepository = documentRepository;
    }

    @Transactional(readOnly = true)
    public List<CategoryResponse> getAllCategories() {
        return categoryRepository.findAll().stream().map(c -> {
            long count = documentRepository.countByCategoryId(c.getId());
            return new CategoryResponse(c.getId(), c.getName(), c.getDescription(), c.getCreatedAt(), count);
        }).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public CategoryResponse getCategoryById(Long id) {
        Category c = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));
        long count = documentRepository.countByCategoryId(c.getId());
        return new CategoryResponse(c.getId(), c.getName(), c.getDescription(), c.getCreatedAt(), count);
    }

    @Transactional
    public CategoryResponse createCategory(CategoryRequest request) {
        String trimmedName = request.getName().trim();
        if (categoryRepository.existsByName(trimmedName)) {
            throw new BadRequestException("A category with name '" + trimmedName + "' already exists.");
        }

        Category category = new Category(trimmedName, request.getDescription() != null ? request.getDescription().trim() : null);
        Category saved = categoryRepository.save(category);
        return new CategoryResponse(saved.getId(), saved.getName(), saved.getDescription(), saved.getCreatedAt(), 0);
    }

    @Transactional
    public CategoryResponse updateCategory(Long id, CategoryRequest request) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));

        String trimmedName = request.getName().trim();
        if (!category.getName().equalsIgnoreCase(trimmedName) && categoryRepository.existsByName(trimmedName)) {
            throw new BadRequestException("Another category with name '" + trimmedName + "' already exists.");
        }

        category.setName(trimmedName);
        category.setDescription(request.getDescription() != null ? request.getDescription().trim() : null);

        Category updated = categoryRepository.save(category);
        long count = documentRepository.countByCategoryId(updated.getId());
        return new CategoryResponse(updated.getId(), updated.getName(), updated.getDescription(), updated.getCreatedAt(), count);
    }

    @Transactional
    public void deleteCategory(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));

        long count = documentRepository.countByCategoryId(id);
        if (count > 0) {
            throw new BadRequestException("Cannot delete category '" + category.getName() + "' because it contains " + count + " document(s). Please delete or move the documents first.");
        }

        categoryRepository.delete(category);
    }

    @Transactional(readOnly = true)
    public List<DocumentResponse> getCategoryDocumentsForUser(Long categoryId, Long userId) {
        if (!categoryRepository.existsById(categoryId)) {
            throw new ResourceNotFoundException("Category not found with id: " + categoryId);
        }

        List<Document> docs = documentRepository.findByUserIdAndCategoryIdOrderByUploadDateDesc(userId, categoryId);
        return docs.stream().map(this::mapToDocumentResponse).collect(Collectors.toList());
    }

    private DocumentResponse mapToDocumentResponse(Document d) {
        DocumentResponse res = new DocumentResponse();
        res.setId(d.getId());
        res.setDocumentName(d.getDocumentName());
        res.setDescription(d.getDescription());
        if (d.getCategory() != null) {
            res.setCategoryId(d.getCategory().getId());
            res.setCategoryName(d.getCategory().getName());
        } else {
            res.setCategoryName("Uncategorized");
        }
        res.setOriginalFilename(d.getOriginalFilename());
        res.setStoredFilename(d.getStoredFilename());
        res.setFileType(d.getFileType());
        res.setFileSize(d.getFileSize());
        res.setUploadDate(d.getUploadDate());
        res.setUpdatedAt(d.getUpdatedAt());
        res.setUserId(d.getUser().getId());
        res.setUserName(d.getUser().getFullName());
        res.setUserEmail(d.getUser().getEmail());
        return res;
    }
}
