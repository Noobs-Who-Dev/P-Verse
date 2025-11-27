package com.app.pverse.service;

import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;

/**
 * Service để handle việc lưu trữ và xóa files
 * Support: avatars, moments, posts, etc.
 */
@Service
@Slf4j
public class FileStorageService {

    @Value("${file.upload-dir:./data/uploads}")
    private String baseUploadDir;

    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    private static final List<String> ALLOWED_IMAGE_TYPES = List.of(
            "image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"
    );

    /**
     * Initialize upload directories on startup
     * CRITICAL: Ensures upload directories exist
     */
    @PostConstruct
    public void init() {
        try {
            // Create base upload directory
            Path uploadPath = Paths.get(baseUploadDir);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
                log.info("✅ Created base upload directory: {}", uploadPath.toAbsolutePath());
            }

            // Create subdirectories
            String[] subdirs = {"moments", "avatars", "posts", "messages"};
            for (String subdir : subdirs) {
                Path subdirPath = uploadPath.resolve(subdir);
                if (!Files.exists(subdirPath)) {
                    Files.createDirectories(subdirPath);
                    log.info("✅ Created {} directory: {}", subdir, subdirPath.toAbsolutePath());
                }
            }

            log.info("✅ FileStorageService initialized successfully");
        } catch (IOException e) {
            log.error("❌ Failed to initialize upload directories", e);
            throw new RuntimeException("Could not create upload directories!", e);
        }
    }

    /**
     * Lưu file moment với validation
     * Path: uploads/moments/{userId}/{filename}
     */
    public String saveMomentImage(MultipartFile file, Long userId) {
        validateImageFile(file);
        return saveFile(file, "moments", userId.toString());
    }

    /**
     * Lưu file avatar với validation
     * Path: uploads/avatars/{userId}/{filename}
     */
    public String saveAvatarImage(MultipartFile file, Long userId) {
        validateImageFile(file);
        return saveFile(file, "avatars", userId.toString());
    }

    /**
     * Lưu file post với validation
     * Path: uploads/posts/{userId}/{filename}
     */
    public String savePostImage(MultipartFile file, Long userId) {
        validateImageFile(file);
        return saveFile(file, "posts", userId.toString());
    }

    /**
     * Lưu file message image với validation
     * Path: uploads/messages/{userId}/{filename}
     */
    public String saveMessageImage(MultipartFile file, Long userId) {
        validateImageFile(file);
        return saveFile(file, "messages", userId.toString());
    }

    /**
     * Generic method để lưu file
     * @param file MultipartFile to save
     * @param subdir Subdirectory (moments, avatars, posts)
     * @param userId User ID as string
     * @return Relative path to saved file
     */
    private String saveFile(MultipartFile file, String subdir, String userId) {
        try {
            // Create directory structure
            Path uploadPath = Paths.get(baseUploadDir, subdir, userId);
            Files.createDirectories(uploadPath);

            // Generate unique filename
            String filename = generateUniqueFilename(file.getOriginalFilename());

            // Save file
            Path targetPath = uploadPath.resolve(filename);
            try (InputStream inputStream = file.getInputStream()) {
                Files.copy(inputStream, targetPath, StandardCopyOption.REPLACE_EXISTING);
            }

            // CRITICAL FIX: Return path with /uploads/ prefix for URL access
            // This allows Spring to serve the file at: http://localhost:8080/uploads/moments/123/file.jpg
            String relativePath = String.format("/uploads/%s/%s/%s", subdir, userId, filename);
            log.info("✅ File saved successfully: {}", relativePath);
            log.info("🌐 Access URL: http://localhost:8080{}", relativePath);
            return relativePath;

        } catch (IOException e) {
            log.error("❌ Failed to save file", e);
            throw new RuntimeException("Failed to save file: " + e.getMessage());
        }
    }

    /**
     * Xóa file theo relative path
     * @param relativePath Path with /uploads/ prefix (e.g., "/uploads/moments/123/file.jpg")
     * @return true if deleted, false if file not found
     */
    public boolean deleteFile(String relativePath) {
        if (relativePath == null || relativePath.isEmpty()) {
            return false;
        }

        try {
            // Remove /uploads/ prefix if present
            String cleanPath = relativePath.startsWith("/uploads/")
                ? relativePath.substring("/uploads/".length())
                : relativePath;

            Path filePath = Paths.get(baseUploadDir, cleanPath);
            boolean deleted = Files.deleteIfExists(filePath);

            if (deleted) {
                log.info("✅ File deleted successfully: {}", relativePath);
            } else {
                log.warn("⚠️ File not found for deletion: {}", relativePath);
            }

            return deleted;

        } catch (IOException e) {
            log.error("❌ Failed to delete file: {}", relativePath, e);
            return false;
        }
    }

    /**
     * Xóa tất cả files trong một directory
     * Useful khi xóa user account
     */
    public void deleteUserFiles(Long userId, String subdir) {
        try {
            Path userDir = Paths.get(baseUploadDir, subdir, userId.toString());
            if (Files.exists(userDir)) {
                Files.walk(userDir)
                        .sorted((a, b) -> b.compareTo(a)) // Delete files before directories
                        .forEach(path -> {
                            try {
                                Files.delete(path);
                            } catch (IOException e) {
                                log.error("Failed to delete: {}", path, e);
                            }
                        });
                log.info("Deleted all files for user {} in {}", userId, subdir);
            }
        } catch (IOException e) {
            log.error("Failed to delete user files", e);
        }
    }

    /**
     * Validate image file
     */
    private void validateImageFile(MultipartFile file) {
        // Check if file is empty
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File is empty");
        }

        // Check file size
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException("File size must not exceed 10MB");
        }

        // Check content type
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_IMAGE_TYPES.contains(contentType.toLowerCase())) {
            throw new IllegalArgumentException(
                    "Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed"
            );
        }

        // Check if file has content
        try {
            if (file.getInputStream().available() == 0) {
                throw new IllegalArgumentException("File has no content");
            }
        } catch (IOException e) {
            throw new IllegalArgumentException("Cannot read file: " + e.getMessage());
        }
    }

    /**
     * Generate unique filename with timestamp and UUID
     * Format: {type}_{timestamp}_{uuid}.{ext}
     */
    private String generateUniqueFilename(String originalFilename) {
        String timestamp = LocalDateTime.now()
                .format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
        String uuid = UUID.randomUUID().toString().substring(0, 8);
        String extension = getFileExtension(originalFilename);

        return String.format("file_%s_%s%s", timestamp, uuid, extension);
    }

    /**
     * Extract file extension from filename
     */
    private String getFileExtension(String filename) {
        if (filename == null) {
            return ".jpg";
        }

        String cleanName = StringUtils.cleanPath(filename);
        int lastDot = cleanName.lastIndexOf('.');

        if (lastDot > 0 && lastDot < cleanName.length() - 1) {
            return cleanName.substring(lastDot);
        }

        return ".jpg"; // Default extension
    }

    /**
     * Check if file exists
     */
    public boolean fileExists(String relativePath) {
        if (relativePath == null || relativePath.isEmpty()) {
            return false;
        }

        Path filePath = Paths.get(baseUploadDir, relativePath);
        return Files.exists(filePath);
    }

    /**
     * Get absolute path from relative path
     */
    public Path getAbsolutePath(String relativePath) {
        return Paths.get(baseUploadDir, relativePath);
    }
}

