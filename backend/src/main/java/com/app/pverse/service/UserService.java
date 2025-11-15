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
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Transactional
public class UserService {
    private final UserRepository userRepository;
    private final UserSettingsRepository settingsRepository;
    private final FriendshipRepository friendshipRepository;
    private final PasswordEncoder passwordEncoder;

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
                .lastSeenAt(user.getLastSeenAt())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
