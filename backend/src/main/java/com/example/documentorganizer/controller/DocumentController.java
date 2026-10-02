package com.example.documentorganizer.controller;

import com.example.documentorganizer.dto.ApiResponse;
import com.example.documentorganizer.dto.DocumentResponse;
import com.example.documentorganizer.entity.Document;
import com.example.documentorganizer.security.UserPrincipal;
import com.example.documentorganizer.service.DocumentService;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.URLConnection;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.List;

@RestController
@RequestMapping("/api/documents")
public class DocumentController {

    private final DocumentService documentService;

    public DocumentController(DocumentService documentService) {
        this.documentService = documentService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<DocumentResponse>>> getUserDocuments(
            @AuthenticationPrincipal UserPrincipal currentUser) {
        List<DocumentResponse> documents = documentService.getUserDocuments(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Documents fetched successfully.", documents));
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<DocumentResponse>> uploadDocument(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @RequestParam("documentName") String documentName,
            @RequestParam(value = "categoryId", required = false) Long categoryId,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam("file") MultipartFile file) {

        DocumentResponse response = documentService.uploadDocument(
                currentUser.getId(),
                documentName,
                categoryId,
                description,
                file
        );
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Document uploaded successfully.", response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<DocumentResponse>> getDocumentById(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        boolean isAdmin = "ROLE_ADMIN".equals(currentUser.getRole());
        DocumentResponse response = documentService.getDocumentById(id, currentUser.getId(), isAdmin);
        return ResponseEntity.ok(ApiResponse.success("Document details fetched successfully.", response));
    }

    @GetMapping("/{id}/download")
    public ResponseEntity<Resource> downloadDocument(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        boolean isAdmin = "ROLE_ADMIN".equals(currentUser.getRole());
        Document document = documentService.getDocumentEntityForDownload(id, currentUser.getId(), isAdmin);
        Resource resource = documentService.loadDocumentResource(document.getStoredFilename());

        String encodedFilename = URLEncoder.encode(document.getOriginalFilename(), StandardCharsets.UTF_8).replace("+", "%20");
        String mimeType = URLConnection.guessContentTypeFromName(document.getOriginalFilename());
        if (mimeType == null) {
            mimeType = "application/octet-stream";
        }

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(mimeType))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + document.getOriginalFilename() + "\"; filename*=UTF-8''" + encodedFilename)
                .body(resource);
    }

    @GetMapping("/{id}/preview")
    public ResponseEntity<Resource> previewDocument(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        boolean isAdmin = "ROLE_ADMIN".equals(currentUser.getRole());
        Document document = documentService.getDocumentEntityForDownload(id, currentUser.getId(), isAdmin);
        Resource resource = documentService.loadDocumentResource(document.getStoredFilename());

        String mimeType = URLConnection.guessContentTypeFromName(document.getOriginalFilename());
        if (mimeType == null) {
            if ("pdf".equalsIgnoreCase(document.getFileType())) {
                mimeType = "application/pdf";
            } else if ("png".equalsIgnoreCase(document.getFileType())) {
                mimeType = "image/png";
            } else if ("jpg".equalsIgnoreCase(document.getFileType()) || "jpeg".equalsIgnoreCase(document.getFileType())) {
                mimeType = "image/jpeg";
            } else {
                mimeType = "application/octet-stream";
            }
        }

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(mimeType))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + document.getOriginalFilename() + "\"")
                .body(resource);
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<DocumentResponse>> updateDocument(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal currentUser,
            @RequestParam(value = "documentName", required = false) String documentName,
            @RequestParam(value = "categoryId", required = false) Long categoryId,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "file", required = false) MultipartFile file) {

        DocumentResponse updated = documentService.updateDocument(
                id,
                currentUser.getId(),
                documentName,
                categoryId,
                description,
                file
        );
        return ResponseEntity.ok(ApiResponse.success("Document updated successfully.", updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteDocument(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        boolean isAdmin = "ROLE_ADMIN".equals(currentUser.getRole());
        documentService.deleteDocument(id, currentUser.getId(), isAdmin);
        return ResponseEntity.ok(ApiResponse.success("Document deleted successfully."));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<DocumentResponse>>> searchDocuments(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @RequestParam(value = "keyword", required = false) String keyword,
            @RequestParam(value = "categoryId", required = false) Long categoryId,
            @RequestParam(value = "fileType", required = false) String fileType) {

        List<DocumentResponse> results = documentService.searchDocuments(
                currentUser.getId(),
                keyword,
                categoryId,
                fileType
        );
        return ResponseEntity.ok(ApiResponse.success("Search results fetched successfully.", results));
    }
}
