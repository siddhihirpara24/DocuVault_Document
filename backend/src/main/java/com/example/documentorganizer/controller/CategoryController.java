package com.example.documentorganizer.controller;

import com.example.documentorganizer.dto.ApiResponse;
import com.example.documentorganizer.dto.CategoryResponse;
import com.example.documentorganizer.dto.DocumentResponse;
import com.example.documentorganizer.security.UserPrincipal;
import com.example.documentorganizer.service.CategoryService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
public class CategoryController {

    private final CategoryService categoryService;

    public CategoryController(CategoryService categoryService) {
        this.categoryService = categoryService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<CategoryResponse>>> getAllCategories() {
        List<CategoryResponse> categories = categoryService.getAllCategories();
        return ResponseEntity.ok(ApiResponse.success("Categories fetched successfully.", categories));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CategoryResponse>> getCategoryById(@PathVariable Long id) {
        CategoryResponse category = categoryService.getCategoryById(id);
        return ResponseEntity.ok(ApiResponse.success("Category fetched successfully.", category));
    }

    @GetMapping("/{id}/documents")
    public ResponseEntity<ApiResponse<List<DocumentResponse>>> getCategoryDocuments(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        List<DocumentResponse> documents = categoryService.getCategoryDocumentsForUser(id, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Category documents fetched successfully.", documents));
    }
}
