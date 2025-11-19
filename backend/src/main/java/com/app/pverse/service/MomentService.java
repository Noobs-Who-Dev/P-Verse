package com.app.pverse.service;

import com.app.pverse.dto.CursorPage;
import com.app.pverse.dto.MomentResponseDTO;
import com.app.pverse.dto.UserSummaryDTO;
import com.app.pverse.dto.request.CreateMomentRequest;
import com.app.pverse.entity.Friendship;
import com.app.pverse.entity.Moment;
import com.app.pverse.entity.Moment.Visibility;
import com.app.pverse.entity.User;
import com.app.pverse.exception.InvalidVisibilityException;
import com.app.pverse.exception.MomentNotFoundException;
import com.app.pverse.exception.UnauthorizedAccessException;
import com.app.pverse.repository.FriendshipRepository;
import com.app.pverse.repository.MomentRepository;
import com.app.pverse.repository.UserRepository;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
@RequiredArgsConstructor
@Slf4j
public class MomentService {

    private final MomentRepository momentRepository;
    private final UserRepository userRepository;
    private final FriendshipRepository friendshipRepository;
    private final FileStorageService fileStorageService;

    /**
     * Feed filter enum for different tab views
     */
    public enum FeedFilter {
        ALL,      // All moments (friends + specific + own)
        FRIENDS,  // Only friends' moments (exclude own)
        MINE      // Only own moments
    }

    /**
     * Tạo moment mới
     */
    @Transactional
    public MomentResponseDTO createMoment(CreateMomentRequest request, MultipartFile image, Long currentUserId) {
        log.info("Creating moment for user: {}", currentUserId);

        // Validate
        validateCreateMomentRequest(request, image);

        // Get current user
        User currentUser = userRepository.findById(currentUserId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        // Validate visibility
        User specificUser = null;
        if (request.getVisibility() == Visibility.SPECIFIC_PERSON) {
            if (request.getSpecificUserId() == null) {
                throw new InvalidVisibilityException("specificUserId is required when visibility is SPECIFIC_PERSON");
            }

            // Validate specific user exists
            specificUser = userRepository.findById(request.getSpecificUserId())
                    .orElseThrow(() -> new IllegalArgumentException("Specific user not found"));

            // Validate they are friends
            if (!areFriends(currentUserId, request.getSpecificUserId())) {
                throw new InvalidVisibilityException("You can only share moments with your friends");
            }
        }

        // Save image file using FileStorageService
        String imagePath = fileStorageService.saveMomentImage(image, currentUserId);

        // Create moment
        Moment moment = Moment.builder()
                .user(currentUser)
                .caption(request.getCaption())
                .imagePath(imagePath)
                .visibility(request.getVisibility())
                .specificUser(specificUser)
                .build();

        Moment savedMoment = momentRepository.save(moment);
        log.info("Moment created successfully: {}", savedMoment.getId());

        return toResponseDTO(savedMoment, currentUserId);
    }

    /**
     * Lấy moment theo ID
     */
    @Transactional(readOnly = true)
    public MomentResponseDTO getMomentById(Long momentId, Long currentUserId) {
        log.info("Getting moment: {} by user: {}", momentId, currentUserId);

        Moment moment = momentRepository.findById(momentId)
                .orElseThrow(() -> new MomentNotFoundException(momentId));

        // Check permission
        if (!hasPermissionToView(moment, currentUserId)) {
            throw new UnauthorizedAccessException("You do not have permission to view this moment");
        }

        return toResponseDTO(moment, currentUserId);
    }

    /**
     * Lấy moments của một user
     */
    @Transactional(readOnly = true)
    public Slice<MomentResponseDTO> getUserMoments(Long userId, Long currentUserId, Pageable pageable) {
        log.info("Getting moments for user: {} by viewer: {}", userId, currentUserId);

        // Validate user exists
        if (!userRepository.existsById(userId)) {
            throw new IllegalArgumentException("User not found");
        }

        Slice<Moment> moments = momentRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable);

        // Filter by permission
        return moments
                .map(moment -> {
                    if (hasPermissionToView(moment, currentUserId)) {
                        return toResponseDTO(moment, currentUserId);
                    }
                    return null;
                })
                .map(dto -> dto); // Filter out nulls is handled by Slice
    }

    /**
     * Lấy feed moments (từ friends + moments được share)
     */
    @Transactional(readOnly = true)
    public Slice<MomentResponseDTO> getFeed(Long currentUserId, Pageable pageable) {
        return getFeedWithFilter(currentUserId, FeedFilter.ALL, pageable);
    }

    /**
     * Lấy feed moments với filter (ALL, FRIENDS, MINE)
     */
    @Transactional(readOnly = true)
    public Slice<MomentResponseDTO> getFeedWithFilter(Long currentUserId, FeedFilter filter, Pageable pageable) {
        log.info("Getting moment feed for user: {} with filter: {}", currentUserId, filter);

        Slice<Moment> moments;

        switch (filter) {
            case FRIENDS:
                // Only friends' moments (exclude own)
                List<Long> friendIds = getFriendIds(currentUserId);
                if (friendIds.isEmpty()) {
                    // No friends, return empty slice
                    moments = momentRepository.findByUserIdOrderByCreatedAtDesc(-1L, pageable); // Non-existent user
                } else {
                    moments = momentRepository.findFriendsMoments(friendIds, currentUserId, pageable);
                }
                break;

            case MINE:
                // Only own moments (all visibilities)
                moments = momentRepository.findByUserIdOrderByCreatedAtDesc(currentUserId, pageable);
                break;

            case ALL:
            default:
                // All moments: friends + specific + own
                List<Long> allFriendIds = getFriendIds(currentUserId);
                if (allFriendIds.isEmpty()) {
                    allFriendIds = new ArrayList<>();
                }
                moments = momentRepository.findFeedMoments(allFriendIds, currentUserId, pageable);
                break;
        }

        // Map to DTO with metadata
        return moments.map(moment -> toResponseDTO(moment, currentUserId));
    }

    /**
     * Lấy feed moments với cursor-based pagination (Bonus feature)
     * @param cursor Base64 encoded string: "{createdAt}_{momentId}"
     * @param limit Number of items to fetch
     */
    @Transactional(readOnly = true)
    public CursorPage<MomentResponseDTO> getFeedWithCursor(Long currentUserId, String cursor, int limit) {
        log.info("Getting moment feed with cursor for user: {}, cursor: {}, limit: {}",
                currentUserId, cursor, limit);

        // Get friend IDs
        List<Long> friendIds = getFriendIds(currentUserId);
        if (friendIds.isEmpty()) {
            friendIds = new ArrayList<>();
        }

        // Fetch limit + 1 để check hasNext
        Pageable pageable = PageRequest.of(0, limit + 1);
        List<Moment> moments;

        if (cursor == null || cursor.isEmpty()) {
            // Initial request (no cursor)
            moments = momentRepository.findFeedMomentsInitial(friendIds, currentUserId, pageable);
        } else {
            // Parse cursor
            CursorData cursorData = parseCursor(cursor);
            moments = momentRepository.findFeedMomentsWithCursor(
                    friendIds,
                    currentUserId,
                    cursorData.getCreatedAt(),
                    cursorData.getMomentId(),
                    pageable
            );
        }

        // Check hasNext
        boolean hasNext = moments.size() > limit;
        if (hasNext) {
            moments = moments.subList(0, limit); // Remove extra item
        }

        // Map to DTO
        List<MomentResponseDTO> dtos = moments.stream()
                .map(moment -> toResponseDTO(moment, currentUserId))
                .collect(Collectors.toList());

        // Build next cursor from last item
        String nextCursor = null;
        if (hasNext && !dtos.isEmpty()) {
            Moment lastMoment = moments.get(moments.size() - 1);
            nextCursor = buildCursor(lastMoment.getCreatedAt(), lastMoment.getId());
        }

        return CursorPage.<MomentResponseDTO>builder()
                .data(dtos)
                .nextCursor(nextCursor)
                .hasNext(hasNext)
                .size(dtos.size())
                .build();
    }

    /**
     * Delete moment (owner only)
     */
    @Transactional
    public void deleteMoment(Long momentId, Long currentUserId) {
        log.info("Deleting moment: {} by user: {}", momentId, currentUserId);

        Moment moment = momentRepository.findById(momentId)
                .orElseThrow(() -> new MomentNotFoundException(momentId));

        // Only owner can delete
        if (!moment.getUser().getId().equals(currentUserId)) {
            throw new UnauthorizedAccessException("You can only delete your own moments");
        }

        // Delete image file
        fileStorageService.deleteFile(moment.getImagePath());

        // Delete moment entity
        momentRepository.delete(moment);
        log.info("Moment deleted successfully: {}", momentId);
    }

    /**
     * Validate create moment request
     */
    private void validateCreateMomentRequest(CreateMomentRequest request, MultipartFile image) {
        // Image validation will be done by FileStorageService
        if (image == null || image.isEmpty()) {
            throw new IllegalArgumentException("Image is required");
        }

        // Validate caption
        if (request.getCaption() != null && request.getCaption().length() > 2200) {
            throw new IllegalArgumentException("Caption must not exceed 2200 characters");
        }

        // Validate visibility
        if (request.getVisibility() == null) {
            throw new IllegalArgumentException("Visibility is required");
        }
    }

    /**
     * Check if current user has permission to view moment
     */
    private boolean hasPermissionToView(Moment moment, Long currentUserId) {
        // Owner can always view
        if (moment.getUser().getId().equals(currentUserId)) {
            return true;
        }

        switch (moment.getVisibility()) {
            case PRIVATE:
                return false;

            case ALL_FRIENDS:
                return areFriends(moment.getUser().getId(), currentUserId);

            case SPECIFIC_PERSON:
                return moment.getSpecificUser() != null
                        && moment.getSpecificUser().getId().equals(currentUserId);

            default:
                return false;
        }
    }

    /**
     * Check if two users are friends
     */
    private boolean areFriends(Long userId1, Long userId2) {
        return friendshipRepository.findStatusBetween(userId1, userId2)
                .map(status -> status == Friendship.FriendshipStatus.ACCEPTED)
                .orElse(false);
    }

    /**
     * Get friend IDs of current user
     */
    private List<Long> getFriendIds(Long userId) {
        List<User> friendsAsUser = friendshipRepository.findAcceptedFriendsAsUser(userId);
        List<User> friendsAsFriend = friendshipRepository.findAcceptedFriendsAsFriend(userId);

        return Stream.concat(friendsAsUser.stream(), friendsAsFriend.stream())
                .map(User::getId)
                .distinct()
                .collect(Collectors.toList());
    }

    /**
     * Parse cursor string: Base64("{createdAt}_{momentId}")
     */
    private CursorData parseCursor(String cursor) {
        try {
            String decoded = new String(java.util.Base64.getDecoder().decode(cursor));
            String[] parts = decoded.split("_");

            if (parts.length != 2) {
                throw new IllegalArgumentException("Invalid cursor format");
            }

            LocalDateTime createdAt = LocalDateTime.parse(parts[0]);
            Long momentId = Long.parseLong(parts[1]);

            return new CursorData(createdAt, momentId);
        } catch (Exception e) {
            log.error("Failed to parse cursor: {}", cursor, e);
            throw new IllegalArgumentException("Invalid cursor: " + e.getMessage());
        }
    }

    /**
     * Build cursor string: Base64("{createdAt}_{momentId}")
     */
    private String buildCursor(LocalDateTime createdAt, Long momentId) {
        String raw = createdAt.toString() + "_" + momentId;
        return java.util.Base64.getEncoder().encodeToString(raw.getBytes());
    }

    /**
     * Convert Moment entity to MomentResponseDTO
     */
    private MomentResponseDTO toResponseDTO(Moment moment, Long currentUserId) {
        return MomentResponseDTO.builder()
                .id(moment.getId())
                .user(toUserSummaryDTO(moment.getUser()))
                .caption(moment.getCaption())
                .imagePath(moment.getImagePath())
                .visibility(moment.getVisibility())
                .specificUser(moment.getSpecificUser() != null ? toUserSummaryDTO(moment.getSpecificUser()) : null)
                .createdAt(moment.getCreatedAt())
                .timeAgo(calculateTimeAgo(moment.getCreatedAt()))
                .reactionCount(0L) // TODO: Implement reaction count when reaction feature is added
                .hasReacted(false) // TODO: Implement hasReacted when reaction feature is added
                .reactionType(null) // TODO: Implement when reaction feature is added
                .build();
    }

    /**
     * Calculate time ago string from timestamp
     */
    private String calculateTimeAgo(LocalDateTime createdAt) {
        if (createdAt == null) {
            return "unknown";
        }

        LocalDateTime now = LocalDateTime.now();
        long seconds = java.time.Duration.between(createdAt, now).getSeconds();

        if (seconds < 60) {
            return seconds + " seconds ago";
        } else if (seconds < 3600) {
            long minutes = seconds / 60;
            return minutes + (minutes == 1 ? " minute ago" : " minutes ago");
        } else if (seconds < 86400) {
            long hours = seconds / 3600;
            return hours + (hours == 1 ? " hour ago" : " hours ago");
        } else if (seconds < 604800) {
            long days = seconds / 86400;
            return days + (days == 1 ? " day ago" : " days ago");
        } else if (seconds < 2592000) {
            long weeks = seconds / 604800;
            return weeks + (weeks == 1 ? " week ago" : " weeks ago");
        } else if (seconds < 31536000) {
            long months = seconds / 2592000;
            return months + (months == 1 ? " month ago" : " months ago");
        } else {
            long years = seconds / 31536000;
            return years + (years == 1 ? " year ago" : " years ago");
        }
    }

    /**
     * Convert User to UserSummaryDTO
     */
    private UserSummaryDTO toUserSummaryDTO(User user) {
        return UserSummaryDTO.builder()
                .id(user.getId())
                .username(user.getUsername())
                .avatarUrl(user.getAvatarUrl())
                .displayName(user.getDisplayName() != null ? user.getDisplayName() : user.getUsername())
                .build();
    }

    /**
     * Inner class để hold cursor data
     */
    @Data
    @AllArgsConstructor
    private static class CursorData {
        private LocalDateTime createdAt;
        private Long momentId;
    }
}

