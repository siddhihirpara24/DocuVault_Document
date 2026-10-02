package com.example.documentorganizer.service;

import com.example.documentorganizer.dto.AdminDashboardResponse;
import com.example.documentorganizer.dto.DocumentResponse;
import com.example.documentorganizer.dto.UserResponse;
import com.example.documentorganizer.entity.Document;
import com.example.documentorganizer.entity.User;
import com.example.documentorganizer.entity.UserStatus;
import com.example.documentorganizer.exception.BadRequestException;
import com.example.documentorganizer.exception.ResourceNotFoundException;
import com.example.documentorganizer.repository.CategoryRepository;
import com.example.documentorganizer.repository.DocumentRepository;
import com.example.documentorganizer.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class AdminService {

    private final UserRepository userRepository;
    private final DocumentRepository documentRepository;
    private final CategoryRepository categoryRepository;
    private final FileStorageService fileStorageService;
    private final DocumentService documentService;

    public AdminService(UserRepository userRepository,
                        DocumentRepository documentRepository,
                        CategoryRepository categoryRepository,
                        FileStorageService fileStorageService,
                        DocumentService documentService) {
        this.userRepository = userRepository;
        this.documentRepository = documentRepository;
        this.categoryRepository = categoryRepository;
        this.fileStorageService = fileStorageService;
        this.documentService = documentService;
    }

    @Transactional(readOnly = true)
    public AdminDashboardResponse getDashboard() {
        AdminDashboardResponse response = new AdminDashboardResponse();

        response.setTotalUsers(userRepository.count());
        response.setTotalDocuments(documentRepository.count());
        response.setTotalCategories(categoryRepository.count());
        response.setActiveUsers(userRepository.countByStatus(UserStatus.ACTIVE));

        LocalDateTime startOfDay = LocalDateTime.of(LocalDate.now(), LocalTime.MIN);
        LocalDateTime endOfDay = LocalDateTime.of(LocalDate.now(), LocalTime.MAX);
        response.setDocumentsUploadedToday(documentRepository.countByUploadDateBetween(startOfDay, endOfDay));

        // Recent users
        List<UserResponse> recentUsers = userRepository.findTop5ByOrderByCreatedAtDesc()
                .stream()
                .map(this::mapToUserResponse)
                .collect(Collectors.toList());
        response.setRecentUsers(recentUsers);

        // Recent documents
        List<DocumentResponse> recentDocs = documentRepository.findTop10ByOrderByUploadDateDesc()
                .stream()
                .limit(5)
                .map(documentService::mapToResponse)
                .collect(Collectors.toList());
        response.setRecentDocuments(recentDocs);

        // Category breakdown
        Map<String, Long> catBreakdown = new HashMap<>();
        for (Object[] row : documentRepository.countDocumentsByCategory()) {
            catBreakdown.put((String) row[0], (Long) row[1]);
        }
        response.setCategoryBreakdown(catBreakdown);

        // File type breakdown
        Map<String, Long> typeBreakdown = new HashMap<>();
        for (Object[] row : documentRepository.countDocumentsByFileType()) {
            typeBreakdown.put((String) row[0], (Long) row[1]);
        }
        response.setFileTypeBreakdown(typeBreakdown);

        return response;
    }

    @Transactional(readOnly = true)
    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::mapToUserResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public UserResponse getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        return mapToUserResponse(user);
    }

    @Transactional
    public void activateUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        user.setStatus(UserStatus.ACTIVE);
        userRepository.save(user);
    }

    @Transactional
    public void deactivateUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        user.setStatus(UserStatus.INACTIVE);
        userRepository.save(user);
    }

    @Transactional
    public void deleteUser(Long id, Long currentAdminId) {
        if (id.equals(currentAdminId)) {
            throw new BadRequestException("Safety rule: You cannot delete your own active administrator account.");
        }

        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

        // Delete all physical files belonging to this user
        List<Document> userDocs = documentRepository.findByUserIdOrderByUploadDateDesc(id);
        for (Document d : userDocs) {
            fileStorageService.deleteFile(d.getStoredFilename());
        }

        // Delete user (cascade will delete docs and tokens)
        userRepository.delete(user);
    }

    @Transactional(readOnly = true)
    public List<DocumentResponse> getAllDocuments(Long userId, Long categoryId, String fileType, String keyword) {
        String cleanKeyword = (keyword != null && !keyword.trim().isEmpty()) ? keyword.trim() : null;
        String cleanFileType = (fileType != null && !fileType.trim().isEmpty()) ? fileType.trim() : null;

        List<Document> docs = documentRepository.searchAdminDocuments(userId, categoryId, cleanFileType, cleanKeyword);
        return docs.stream().map(documentService::mapToResponse).collect(Collectors.toList());
    }

    @Transactional
    public void deleteDocument(Long id) {
        Document document = documentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Document not found with id: " + id));

        fileStorageService.deleteFile(document.getStoredFilename());
        documentRepository.delete(document);
    }

    private UserResponse mapToUserResponse(User user) {
        long docCount = documentRepository.countByUserId(user.getId());
        return new UserResponse(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getPhone(),
                user.getRole().name(),
                user.getStatus().name(),
                user.getCreatedAt(),
                user.getUpdatedAt(),
                docCount
        );
    }
}
