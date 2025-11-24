package com.app.pverse.service;

import com.app.pverse.dto.request.ChangePasswordRequest;
import com.app.pverse.dto.request.RegisterRequest;
import com.app.pverse.dto.request.UpdateProfileRequest;
import com.app.pverse.dto.request.UpdateUserRequest;
import com.app.pverse.dto.response.UserDto;
import com.app.pverse.dto.response.UserProfileDto;
import com.app.pverse.dto.response.ProfileStatsDto;
import com.app.pverse.entity.User;
import com.app.pverse.entity.UserSettings;
import com.app.pverse.repository.UserRepository;
import com.app.pverse.repository.UserSettingsRepository;
import com.app.pverse.repository.FriendshipRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
@Transactional
public class UserService {
    private final UserRepository userRepository;
    private final UserSettingsRepository settingsRepository;
    private final FriendshipRepository friendshipRepository;
    private final PasswordEncoder passwordEncoder;

    private String uploadDir = "uploads/avatars"; // Default value

    public UserService(UserRepository userRepository,
                       UserSettingsRepository settingsRepository,
                       FriendshipRepository friendshipRepository,
                       PasswordEncoder passwordEncoder,
                       @Value("${app.upload.dir:uploads/avatars}") String uploadDir) {
        this.userRepository = userRepository;
        this.settingsRepository = settingsRepository;
        this.friendshipRepository = friendshipRepository;
        this.passwordEncoder = passwordEncoder;
        this.uploadDir = uploadDir;
    }

    @Transactional(readOnly = true)
    public UserDto getUserById(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User không tồn tại"));
        return toDto(user);
    }

    @Transactional(readOnly = true)
    public UserDto getUserByUsername(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User không tồn tại"));
        return toDto(user);
    }

    public UserDto register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new IllegalArgumentException("Username đã tồn tại");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email đã tồn tại");
        }

        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .displayName(request.getDisplayName() != null ? request.getDisplayName() : request.getUsername())
                .build();

        User savedUser = userRepository.save(user);

        // Tự động tạo settings mặc định
        UserSettings settings = UserSettings.builder()
                .user(savedUser)
                .build();
        settingsRepository.save(settings);

        return toDto(savedUser);
    }

    public UserDto updateProfile(Long userId, UpdateProfileRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User không tồn tại"));

        // Check if username is being changed and if it's already taken
        if (request.getUsername() != null && !request.getUsername().isBlank()) {
            if (!user.getUsername().equals(request.getUsername())) {
                // Username is changing, check if new username is available
                if (userRepository.findByUsername(request.getUsername()).isPresent()) {
                    throw new IllegalArgumentException("Username đã tồn tại");
                }
                user.setUsername(request.getUsername());
            }
        }

        // Check if email is being changed and if it's already taken
        if (request.getEmail() != null && !request.getEmail().isBlank()) {
            if (!user.getEmail().equals(request.getEmail())) {
                // Email is changing, check if new email is available
                if (userRepository.findByEmail(request.getEmail()).isPresent()) {
                    throw new IllegalArgumentException("Email đã tồn tại");
                }
                user.setEmail(request.getEmail());
            }
        }

        if (request.getDisplayName() != null && !request.getDisplayName().isBlank()) {
            user.setDisplayName(request.getDisplayName());
        }
        if (request.getBio() != null) {
            user.setBio(request.getBio());
        }

        return toDto(userRepository.save(user));
    }

    public UserDto updateUser(Long userId, UpdateUserRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User không tồn tại"));

        if (request.getDisplayName() != null) {
            user.setDisplayName(request.getDisplayName());
        }
        if (request.getBio() != null) {
            user.setBio(request.getBio());
        }
        if (request.getPhoneNumber() != null) {
            user.setPhoneNumber(request.getPhoneNumber());
        }
        if (request.getAvatarUrl() != null) {
            user.setAvatarUrl(request.getAvatarUrl());
        }

        return toDto(userRepository.save(user));
    }

    public void changePassword(Long userId, ChangePasswordRequest request) {
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new IllegalArgumentException("Password không khớp");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User không tồn tại"));

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Current password không đúng");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    public void updateOnlineStatus(Long userId, Boolean isOnline) {
        userRepository.updateOnlineStatus(userId, isOnline, LocalDateTime.now());
    }

    /**
     * Lấy profile đầy đủ của user với stats
     */
    @Transactional(readOnly = true)
    public UserProfileDto getUserProfile(Long targetUserId, Long viewerId) {
        User targetUser = userRepository.findById(targetUserId)
                .orElseThrow(() -> new RuntimeException("User không tồn tại"));

        // Check if viewing own profile
        boolean isOwnProfile = targetUserId.equals(viewerId);

        // Get stats - wrap in try-catch to prevent 500 error
        Long friendsCount = 0L;
        try {
            friendsCount = friendshipRepository.countFriends(targetUserId);
        } catch (Exception e) {
            // Log error but don't fail the entire request
            System.err.println("Error counting friends for user " + targetUserId + ": " + e.getMessage());
        }

        ProfileStatsDto stats = ProfileStatsDto.builder()
                .userId(targetUserId)
                .postsCount(0) // TODO: Implement when Post entity is ready
                .followersCount(friendsCount != null ? friendsCount.intValue() : 0)
                .followingCount(friendsCount != null ? friendsCount.intValue() : 0)
                .build();

        // Get relationship status if not own profile
        String relationshipStatus = null;
        if (!isOwnProfile) {
            relationshipStatus = determineRelationshipStatus(viewerId, targetUserId);
        }

        return UserProfileDto.builder()
                .user(toDto(targetUser))
                .stats(stats)
                .isOwnProfile(isOwnProfile)
                .relationshipStatus(relationshipStatus)
                .build();
    }

    /**
     * Xác định relationship status giữa viewer và target
     */
    private String determineRelationshipStatus(Long viewerId, Long targetUserId) {
        try {
            return friendshipRepository.findFriendshipBetween(viewerId, targetUserId)
                    .map(friendship -> {
                        return switch (friendship.getStatus()) {
                            case ACCEPTED -> "FRIEND";
                            case PENDING -> friendship.getRequester().getId().equals(viewerId)
                                    ? "PENDING_SENT"
                                    : "PENDING_RECEIVED";
                            default -> "STRANGER";
                        };
                    })
                    .orElse("STRANGER");
        } catch (Exception e) {
            System.err.println("Error determining relationship status: " + e.getMessage());
            return "STRANGER";
        }
    }

    private UserDto toDto(User user) {
        return UserDto.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .displayName(user.getDisplayName())
                .bio(user.getBio())
                .avatarUrl(user.getAvatarUrl())
                .phoneNumber(user.getPhoneNumber())
                .isOnline(user.getIsOnline())
                .status(user.getStatus())
                .lastSeenAt(user.getLastSeenAt())
                .lastActivityAt(user.getLastActivityAt())
                .createdAt(user.getCreatedAt())
                .build();
    }

    public UserDto updateAvatar(Long userId, MultipartFile file) {
        System.out.println("[Upload Avatar] Starting for userId: " + userId);
        System.out.println("[Upload Avatar] Upload directory: " + uploadDir);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User không tồn tại"));

        // Validate file
        if (file.isEmpty()) {
            throw new IllegalArgumentException("File không được để trống");
        }

        // Validate file type
        String contentType = file.getContentType();
        System.out.println("[Upload Avatar] Content type: " + contentType);
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new IllegalArgumentException("File phải là hình ảnh");
        }

        // Validate file size (max 5MB)
        System.out.println("[Upload Avatar] File size: " + file.getSize() + " bytes");
        if (file.getSize() > 5 * 1024 * 1024) {
            throw new IllegalArgumentException("Kích thước file không được vượt quá 5MB");
        }

        try {
            // Create upload directory if not exists
            Path uploadPath = Paths.get(uploadDir);
            System.out.println("[Upload Avatar] Upload path: " + uploadPath.toAbsolutePath());

            if (!Files.exists(uploadPath)) {
                System.out.println("[Upload Avatar] Creating directory...");
                Files.createDirectories(uploadPath);
                System.out.println("[Upload Avatar] Directory created successfully");
            } else {
                System.out.println("[Upload Avatar] Directory already exists");
            }

            // Delete old avatar if exists
            if (user.getAvatarUrl() != null && !user.getAvatarUrl().isEmpty()) {
                System.out.println("[Upload Avatar] Deleting old avatar: " + user.getAvatarUrl());
                deleteOldAvatar(user.getAvatarUrl());
            }

            // Generate unique filename
            String originalFilename = file.getOriginalFilename();
            String fileExtension = originalFilename != null && originalFilename.contains(".")
                    ? originalFilename.substring(originalFilename.lastIndexOf("."))
                    : ".jpg";
            String newFilename = "avatar_" + userId + "_" + UUID.randomUUID() + fileExtension;
            System.out.println("[Upload Avatar] New filename: " + newFilename);

            // Save file
            Path filePath = uploadPath.resolve(newFilename);
            System.out.println("[Upload Avatar] Saving to: " + filePath.toAbsolutePath());
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
            System.out.println("[Upload Avatar] File saved successfully");

            // Update user avatar URL
            String avatarUrl = "/uploads/avatars/" + newFilename;
            user.setAvatarUrl(avatarUrl);
            userRepository.save(user);
            System.out.println("[Upload Avatar] Database updated with URL: " + avatarUrl);

            return toDto(user);
        } catch (IOException e) {
            System.err.println("[Upload Avatar] ERROR: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Không thể upload file: " + e.getMessage(), e);
        }
    }

    public UserDto removeAvatar(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User không tồn tại"));

        // Delete old avatar file if exists
        if (user.getAvatarUrl() != null && !user.getAvatarUrl().isEmpty()) {
            deleteOldAvatar(user.getAvatarUrl());
        }

        // Set avatar to null
        user.setAvatarUrl(null);
        userRepository.save(user);

        return toDto(user);
    }

    private void deleteOldAvatar(String avatarUrl) {
        try {
            // Extract filename from URL
            String filename = avatarUrl.substring(avatarUrl.lastIndexOf("/") + 1);
            Path filePath = Paths.get(uploadDir, filename);

            // Delete file if exists
            if (Files.exists(filePath)) {
                Files.delete(filePath);
            }
        } catch (IOException e) {
            System.err.println("Không thể xóa file avatar cũ: " + e.getMessage());
            // Don't throw exception, just log the error
        }
    }
}
