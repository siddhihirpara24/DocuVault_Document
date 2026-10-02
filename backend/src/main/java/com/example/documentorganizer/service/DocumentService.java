package com.example.documentorganizer.service;

import com.example.documentorganizer.dto.DocumentResponse;
import com.example.documentorganizer.dto.UserDashboardResponse;
import com.example.documentorganizer.entity.Category;
import com.example.documentorganizer.entity.Document;
import com.example.documentorganizer.entity.User;
import com.example.documentorganizer.exception.BadRequestException;
import com.example.documentorganizer.exception.ResourceNotFoundException;
import com.example.documentorganizer.exception.UnauthorizedException;
import com.example.documentorganizer.repository.CategoryRepository;
import com.example.documentorganizer.repository.DocumentRepository;
import com.example.documentorganizer.repository.UserRepository;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class DocumentService {

    private final DocumentRepository documentRepository;
    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final FileStorageService fileStorageService;

    public DocumentService(DocumentRepository documentRepository,
                           UserRepository userRepository,
                           CategoryRepository categoryRepository,
                           FileStorageService fileStorageService) {
        this.documentRepository = documentRepository;
        this.userRepository = userRepository;
        this.categoryRepository = categoryRepository;
        this.fileStorageService = fileStorageService;
    }

    @Transactional
    public DocumentResponse uploadDocument(Long userId, String documentName, Long categoryId,
                                          String description, MultipartFile file) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        if (documentName == null || documentName.trim().isEmpty()) {
            throw new BadRequestException("Document title/name is required.");
        }

        Category category = null;
        if (categoryId != null) {
            category = categoryRepository.findById(categoryId)
                    .orElseThrow(() -> new ResourceNotFoundException("Selected category does not exist."));
        }

        FileStorageService.StoredFileInfo fileInfo = fileStorageService.storeFile(file);

        Document document = new Document(
                user,
                category,
                documentName.trim(),
                description != null ? description.trim() : null,
                fileInfo.getOriginalFilename(),
                fileInfo.getStoredFilename(),
                fileInfo.getFilePath(),
                fileInfo.getFileType(),
                fileInfo.getFileSize()
        );

        Document saved = documentRepository.save(document);
        return mapToResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<DocumentResponse> getUserDocuments(Long userId) {
        return documentRepository.findByUserIdOrderByUploadDateDesc(userId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public DocumentResponse getDocumentById(Long id, Long userId, boolean isAdmin) {
        Document document = documentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Document not found with id: " + id));

        // Strict ownership check: only owner or administrator can view metadata
        if (!isAdmin && !document.getUser().getId().equals(userId)) {
            throw new UnauthorizedException("Access denied: You do not own this document.");
        }

        return mapToResponse(document);
    }

    @Transactional(readOnly = true)
    public Document getDocumentEntityForDownload(Long id, Long userId, boolean isAdmin) {
        Document document = documentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Document not found with id: " + id));

        // Strict ownership check: only owner or administrator can download
        if (!isAdmin && !document.getUser().getId().equals(userId)) {
            throw new UnauthorizedException("Access denied: You do not own this document.");
        }

        return document;
    }

    public Resource loadDocumentResource(String storedFilename) {
        return fileStorageService.loadFileAsResource(storedFilename);
    }

    @Transactional
    public DocumentResponse updateDocument(Long id, Long userId, String documentName,
                                          Long categoryId, String description, MultipartFile newFile) {
        Document document = documentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Document not found with id: " + id));

        // Strict ownership check: only owner can edit their document
        if (!document.getUser().getId().equals(userId)) {
            throw new UnauthorizedException("Access denied: You cannot edit another user's document.");
        }

        if (documentName != null && !documentName.trim().isEmpty()) {
            document.setDocumentName(documentName.trim());
        }

        if (categoryId != null) {
            Category category = categoryRepository.findById(categoryId)
                    .orElseThrow(() -> new ResourceNotFoundException("Selected category does not exist."));
            document.setCategory(category);
        } else {
            document.setCategory(null);
        }

        document.setDescription(description != null ? description.trim() : null);

        // If replacing existing file
        if (newFile != null && !newFile.isEmpty()) {
            String oldStoredFilename = document.getStoredFilename();
            FileStorageService.StoredFileInfo fileInfo = fileStorageService.storeFile(newFile);

            document.setOriginalFilename(fileInfo.getOriginalFilename());
            document.setStoredFilename(fileInfo.getStoredFilename());
            document.setFilePath(fileInfo.getFilePath());
            document.setFileType(fileInfo.getFileType());
            document.setFileSize(fileInfo.getFileSize());

            // Safely delete previous file from storage
            fileStorageService.deleteFile(oldStoredFilename);
        }

        Document updated = documentRepository.save(document);
        return mapToResponse(updated);
    }

    @Transactional
    public void deleteDocument(Long id, Long userId, boolean isAdmin) {
        Document document = documentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Document not found with id: " + id));

        // Strict ownership check: only owner or administrator can delete
        if (!isAdmin && !document.getUser().getId().equals(userId)) {
            throw new UnauthorizedException("Access denied: You cannot delete another user's document.");
        }

        // Delete physical file
        fileStorageService.deleteFile(document.getStoredFilename());

        // Delete database record
        documentRepository.delete(document);
    }

    @Transactional(readOnly = true)
    public List<DocumentResponse> searchDocuments(Long userId, String keyword, Long categoryId, String fileType) {
        String cleanKeyword = (keyword != null && !keyword.trim().isEmpty()) ? keyword.trim() : null;
        String cleanFileType = (fileType != null && !fileType.trim().isEmpty()) ? fileType.trim() : null;

        List<Document> docs = documentRepository.searchUserDocuments(userId, cleanKeyword, categoryId, cleanFileType);
        return docs.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public UserDashboardResponse getUserDashboard(Long userId) {
        UserDashboardResponse response = new UserDashboardResponse();

        response.setTotalDocuments(documentRepository.countByUserId(userId));
        response.setEducationCount(documentRepository.countByUserIdAndCategoryName(userId, "Education"));
        response.setIdentityCount(documentRepository.countByUserIdAndCategoryName(userId, "Identity"));
        response.setCareerCount(documentRepository.countByUserIdAndCategoryName(userId, "Career"));
        response.setFinancialCount(documentRepository.countByUserIdAndCategoryName(userId, "Financial"));
        response.setBillsCount(documentRepository.countByUserIdAndCategoryName(userId, "Bills"));
        response.setCertificatesCount(documentRepository.countByUserIdAndCategoryName(userId, "Certificates"));
        response.setMedicalCount(documentRepository.countByUserIdAndCategoryName(userId, "Medical"));
        response.setOtherCount(documentRepository.countByUserIdAndCategoryName(userId, "Other"));

        List<DocumentResponse> recent = documentRepository.findTop5ByUserIdOrderByUploadDateDesc(userId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
        response.setRecentDocuments(recent);

        return response;
    }

    public DocumentResponse mapToResponse(Document d) {
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
