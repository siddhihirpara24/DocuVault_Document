package com.example.documentorganizer.service;

import com.example.documentorganizer.exception.BadRequestException;
import com.example.documentorganizer.exception.FileStorageException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Service
public class FileStorageService {

    private final Path fileStorageLocation;
    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
    private static final Set<String> ALLOWED_EXTENSIONS = new HashSet<>(
            Arrays.asList("pdf", "jpg", "jpeg", "png", "doc", "docx")
    );

    public FileStorageService(@Value("${app.upload.dir:uploads}") String uploadDir) {
        this.fileStorageLocation = Paths.get(uploadDir).toAbsolutePath().normalize();

        try {
            Files.createDirectories(this.fileStorageLocation);
        } catch (Exception ex) {
            throw new FileStorageException("Could not create directory for storing uploaded files.", ex);
        }
    }

    public static class StoredFileInfo {
        private final String originalFilename;
        private final String storedFilename;
        private final String filePath;
        private final String fileType;
        private final long fileSize;

        public StoredFileInfo(String originalFilename, String storedFilename, String filePath, String fileType, long fileSize) {
            this.originalFilename = originalFilename;
            this.storedFilename = storedFilename;
            this.filePath = filePath;
            this.fileType = fileType;
            this.fileSize = fileSize;
        }

        public String getOriginalFilename() { return originalFilename; }
        public String getStoredFilename() { return storedFilename; }
        public String getFilePath() { return filePath; }
        public String getFileType() { return fileType; }
        public long getFileSize() { return fileSize; }
    }

    public StoredFileInfo storeFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Please select a file to upload.");
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new BadRequestException("File size exceeds 10 MB limit.");
        }

        String rawFilename = StringUtils.cleanPath(file.getOriginalFilename() != null ? file.getOriginalFilename() : "unnamed");

        if (rawFilename.contains("..")) {
            throw new BadRequestException("Filename contains invalid path sequence: " + rawFilename);
        }

        String extension = getFileExtension(rawFilename).toLowerCase();
        if (!ALLOWED_EXTENSIONS.contains(extension)) {
            throw new BadRequestException("Invalid file format ." + extension + ". Allowed formats: " + ALLOWED_EXTENSIONS);
        }

        String uniqueStoredFilename = UUID.randomUUID().toString() + "-" + rawFilename.replaceAll("[^a-zA-Z0-9._-]", "_");

        try {
            Path targetLocation = this.fileStorageLocation.resolve(uniqueStoredFilename).normalize();
            if (!targetLocation.startsWith(this.fileStorageLocation)) {
                throw new BadRequestException("Cannot store file outside current directory.");
            }

            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            return new StoredFileInfo(
                    rawFilename,
                    uniqueStoredFilename,
                    targetLocation.toString(),
                    extension,
                    file.getSize()
            );
        } catch (IOException ex) {
            throw new FileStorageException("Failed to store file " + rawFilename, ex);
        }
    }

    public Resource loadFileAsResource(String storedFilename) {
        try {
            Path filePath = this.fileStorageLocation.resolve(storedFilename).normalize();
            if (!filePath.startsWith(this.fileStorageLocation)) {
                throw new BadRequestException("File access denied.");
            }

            Resource resource = new UrlResource(filePath.toUri());
            if (resource.exists() && resource.isReadable()) {
                return resource;
            } else {
                throw new FileStorageException("File not found or unreadable: " + storedFilename);
            }
        } catch (MalformedURLException ex) {
            throw new FileStorageException("File not found: " + storedFilename, ex);
        }
    }

    public boolean deleteFile(String storedFilename) {
        if (storedFilename == null || storedFilename.isBlank()) {
            return false;
        }
        try {
            Path filePath = this.fileStorageLocation.resolve(storedFilename).normalize();
            if (filePath.startsWith(this.fileStorageLocation)) {
                return Files.deleteIfExists(filePath);
            }
            return false;
        } catch (IOException ex) {
            // Log but don't fail entire operation
            return false;
        }
    }

    private String getFileExtension(String filename) {
        int lastIndex = filename.lastIndexOf('.');
        if (lastIndex == -1 || lastIndex == filename.length() - 1) {
            return "";
        }
        return filename.substring(lastIndex + 1);
    }
}
