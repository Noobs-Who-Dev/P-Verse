package com.app.pverse.service;

import com.app.pverse.dto.CursorPage;
import com.app.pverse.dto.MomentResponseDTO;
import com.app.pverse.dto.UserSummaryDTO;
import com.app.pverse.dto.request.CreateMomentRequest;
import com.app.pverse.dto.request.UpdateMomentRequest;
import com.app.pverse.entity.Friendship;
import com.app.pverse.entity.Moment;
import com.app.pverse.entity.Moment.Visibility;
import com.app.pverse.entity.MomentReaction;
import com.app.pverse.entity.SavedMoment;
import com.app.pverse.entity.User;
import com.app.pverse.exception.InvalidVisibilityException;
import com.app.pverse.exception.MomentNotFoundException;
import com.app.pverse.exception.UnauthorizedAccessException;
import com.app.pverse.repository.FriendshipRepository;
import com.app.pverse.repository.MomentRepository;
import com.app.pverse.repository.SavedMomentRepository;
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

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
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
    private final com.app.pverse.repository.MomentReactionRepository momentReactionRepository;
    private final SavedMomentRepository savedMomentRepository;

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
     * Update moment (owner only)
     */
    @Transactional
    public MomentResponseDTO updateMoment(Long momentId, UpdateMomentRequest request, Long currentUserId) {
        log.info("Updating moment: {} by user: {}", momentId, currentUserId);

        Moment moment = momentRepository.findById(momentId)
                .orElseThrow(() -> new MomentNotFoundException(momentId));

        // Only owner can update
        if (!moment.getUser().getId().equals(currentUserId)) {
            throw new UnauthorizedAccessException("You can only update your own moments");
        }

        // Update fields
        boolean hasChanges = false;

        if (request.getCaption() != null) {
            moment.setCaption(request.getCaption());
            hasChanges = true;
        }

        if (request.getVisibility() != null) {
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

            moment.setVisibility(request.getVisibility());
            moment.setSpecificUser(specificUser);
            hasChanges = true;
        }

        // Handle image update
        if (request.getImage() != null) {
            // Delete old image
            fileStorageService.deleteFile(moment.getImagePath());

            // Save new image
            String newImagePath = fileStorageService.saveMomentImage(request.getImage(), currentUserId);
            moment.setImagePath(newImagePath);
            hasChanges = true;
        }

        if (!hasChanges) {
            log.info("No changes detected for moment: {}", momentId);
        }

        // Save and return updated moment
        Moment savedMoment = momentRepository.save(moment);
        log.info("Moment updated successfully: {}", momentId);

        return toResponseDTO(savedMoment, currentUserId);
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
     * Includes reaction info for current user
     */
    private MomentResponseDTO toResponseDTO(Moment moment, Long currentUserId) {
        // Get total reaction count for this moment
        Long reactionCount = momentReactionRepository.countByMomentId(moment.getId());

        // Check if current user has reacted and get their reaction type
        var userReaction = momentReactionRepository.findByMomentIdAndUserId(moment.getId(), currentUserId);

        // Check if current user has saved this moment
        boolean isSaved = savedMomentRepository.existsByUserIdAndMomentId(currentUserId, moment.getId());

        return MomentResponseDTO.builder()
                .id(moment.getId())
                .user(toUserSummaryDTO(moment.getUser()))
                .caption(moment.getCaption())
                .imagePath(moment.getImagePath())
                .visibility(moment.getVisibility())
                .specificUser(moment.getSpecificUser() != null ? toUserSummaryDTO(moment.getSpecificUser()) : null)
                .createdAt(moment.getCreatedAt())
                .timeAgo(calculateTimeAgo(moment.getCreatedAt()))
                .reactionCount(reactionCount)
                .hasReacted(userReaction.isPresent())
                .reactionType(userReaction.map(r -> r.getReactionType().name()).orElse(null))
                .isSaved(isSaved)
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

    // ==================== REACTION METHODS ====================

    /**
     * Add or toggle reaction to a moment
     * If user already has same reaction → Remove (toggle off)
     * If user has different reaction → Update
     * If user has no reaction → Add new
     */
    @Transactional
    public Map<String, Object> addOrToggleReaction(Long momentId, Long userId, MomentReaction.ReactionType reactionType) {
        log.info("🎯 addOrToggleReaction: momentId={}, userId={}, type={}", momentId, userId, reactionType);

        // Verify moment exists
        Moment moment = momentRepository.findById(momentId)
                .orElseThrow(() -> new MomentNotFoundException(momentId));

        // Verify user exists
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Check if user can view moment (permission check)
        // For ALL_FRIENDS visibility, user must be a friend
        if (!canUserReactToMoment(moment, userId)) {
            log.error("❌ User {} cannot react to moment {}", userId, momentId);
            throw new UnauthorizedAccessException("You don't have permission to react to this moment");
        }

        // Find existing reaction
        var existingReaction = momentReactionRepository.findByMomentIdAndUserId(momentId, userId);

        String action;
        MomentReaction.ReactionType finalReactionType;

        if (existingReaction.isPresent()) {
            MomentReaction reaction = existingReaction.get();

            if (reaction.getReactionType() == reactionType) {
                // Same reaction → Remove (toggle off)
                momentReactionRepository.delete(reaction);
                action = "removed";
                finalReactionType = null;
                log.info("✅ Reaction removed (toggle off)");
            } else {
                // Different reaction → Update
                reaction.setReactionType(reactionType);
                momentReactionRepository.save(reaction);
                action = "updated";
                finalReactionType = reactionType;
                log.info("✅ Reaction updated: {} → {}", reaction.getReactionType(), reactionType);
            }
        } else {
            // No existing reaction → Add new
            MomentReaction newReaction = MomentReaction.builder()
                    .moment(moment)
                    .user(user)
                    .reactionType(reactionType)
                    .build();
            momentReactionRepository.save(newReaction);
            action = "added";
            finalReactionType = reactionType;
            log.info("✅ New reaction added");
        }

        // Get total reaction count
        long totalReactions = momentReactionRepository.countByMomentId(momentId);

        Map<String, Object> result = new java.util.HashMap<>();
        result.put("action", action);
        result.put("reactionType", finalReactionType != null ? finalReactionType.name() : null);
        result.put("totalReactions", totalReactions);

        return result;
    }

    /**
     * Get user's reaction for a moment
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getUserReaction(Long momentId, Long userId) {
        log.info("📋 getUserReaction: momentId={}, userId={}", momentId, userId);

        var reaction = momentReactionRepository.findByMomentIdAndUserId(momentId, userId);

        if (reaction.isEmpty()) {
            return Map.of();
        }

        MomentReaction r = reaction.get();
        Map<String, Object> result = new java.util.HashMap<>();
        result.put("reactionType", r.getReactionType().name());
        result.put("createdAt", r.getCreatedAt());

        return result;
    }

    /**
     * Remove reaction from a moment
     */
    @Transactional
    public void removeReaction(Long momentId, Long userId) {
        log.info("🗑️ removeReaction: momentId={}, userId={}", momentId, userId);

        momentReactionRepository.findByMomentIdAndUserId(momentId, userId)
                .ifPresent(reaction -> {
                    momentReactionRepository.delete(reaction);
                    log.info("✅ Reaction deleted");
                });
    }

    /**
     * Check if user can react to a moment (permission check)
     * User can react if:
     * 1. They are the owner
     * 2. Moment visibility is ALL_FRIENDS AND user is a friend
     * 3. Moment visibility is SPECIFIC_PERSON AND user is the specific person
     */
    private boolean canUserReactToMoment(Moment moment, Long userId) {
        // Owner can always react
        if (moment.getUser().getId().equals(userId)) {
            log.info("✅ User is owner");
            return true;
        }

        Moment.Visibility visibility = moment.getVisibility();
        log.info("   Checking visibility: {}", visibility);

        if (visibility == Moment.Visibility.PRIVATE) {
            // Only owner can react to private moments
            log.info("❌ PRIVATE moment - only owner can react");
            return false;
        }

        if (visibility == Moment.Visibility.ALL_FRIENDS) {
            // Must be friends with moment owner
            boolean areFriends = areFriends(moment.getUser().getId(), userId);
            log.info("   Are friends? {}", areFriends);
            return areFriends;
        }

        if (visibility == Moment.Visibility.SPECIFIC_PERSON) {
            // Must be the specific person
            boolean isSpecificPerson = moment.getSpecificUser() != null
                    && moment.getSpecificUser().getId().equals(userId);
            log.info("   Is specific person? {}", isSpecificPerson);
            return isSpecificPerson;
        }

        return false;
    }

    /**
     * Get recent reactions for a moment (for Activity button)
     * Returns up to 5 most recent reactions with user avatars
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getRecentReactions(Long momentId) {
        log.info("📋 getRecentReactions: momentId={}", momentId);

        // Get up to 5 most recent reactions
        var reactions = momentReactionRepository.findTop5ByMomentIdOrderByCreatedAtDesc(momentId);

        List<Map<String, ? extends Serializable>> recentReactors = reactions.stream()
                .map(reaction -> Map.of(
                        "userId", reaction.getUser().getId(),
                        "username", reaction.getUser().getUsername(),
                        "avatarUrl", reaction.getUser().getAvatarUrl(),
                        "reactionType", reaction.getReactionType().name(),
                        "createdAt", reaction.getCreatedAt()
                ))
                .collect(Collectors.toList());

        Map<String, Object> result = new HashMap<>();
        result.put("count", recentReactors.size());
        result.put("reactors", recentReactors);

        log.info("✅ Found {} recent reactions", recentReactors.size());
        return result;
    }

    /**
     * Get activity data for a moment (views and reactions)
     * Views: Temporarily use reactors as viewers
     * Reactions: All reactions with details
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getMomentActivity(Long momentId) {
        log.info("📋 getMomentActivity: momentId={}", momentId);

        // Get all reactions for this moment
        var reactions = momentReactionRepository.findByMomentIdOrderByCreatedAtDesc(momentId);

        // For now, viewers = reactors (people who reacted are considered viewers)
        List<Map<String, ? extends Serializable>> viewers = reactions.stream()
                .map(reaction -> Map.of(
                        "userId", reaction.getUser().getId(),
                        "username", reaction.getUser().getUsername(),
                        "avatarUrl", reaction.getUser().getAvatarUrl(),
                        "viewedAt", reaction.getCreatedAt()
                ))
                .collect(Collectors.toList());

        // Reactions with details
        List<Map<String, ? extends Serializable>> reactionDetails = reactions.stream()
                .map(reaction -> Map.of(
                        "userId", reaction.getUser().getId(),
                        "username", reaction.getUser().getUsername(),
                        "avatarUrl", reaction.getUser().getAvatarUrl(),
                        "reactionType", reaction.getReactionType().name(),
                        "emoji", getReactionEmoji(reaction.getReactionType()),
                        "reactedAt", reaction.getCreatedAt()
                ))
                .collect(Collectors.toList());

        Map<String, Object> result = new HashMap<>();
        result.put("viewers", viewers);
        result.put("reactions", reactionDetails);
        result.put("totalViews", viewers.size());
        result.put("totalReactions", reactionDetails.size());

        log.info("✅ Found {} viewers and {} reactions", viewers.size(), reactionDetails.size());
        return result;
    }

    /**
     * Get emoji representation for reaction type
     */
    private String getReactionEmoji(MomentReaction.ReactionType reactionType) {
        switch (reactionType) {
            case LIKE: return "👍";
            case LOVE: return "❤️";
            case HAHA: return "😂";
            case WOW: return "😮";
            case SAD: return "😢";
            case ANGRY: return "😠";
            default: return "👍";
        }
    }

    // ==================== SAVE METHODS ====================

    /**
     * Save a moment for the user
     */
    @Transactional
    public void saveMoment(Long momentId, Long userId) {
        log.info("💾 saveMoment: momentId={}, userId={}", momentId, userId);

        // Verify moment exists
        Moment moment = momentRepository.findById(momentId)
                .orElseThrow(() -> new MomentNotFoundException(momentId));

        // Verify user exists
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Check if already saved
        if (savedMomentRepository.existsByUserIdAndMomentId(userId, momentId)) {
            log.warn("⚠️ Moment {} already saved by user {}", momentId, userId);
            return; // Idempotent - do nothing if already saved
        }

        // Check permission to view (user must be able to view the moment to save it)
        if (!hasPermissionToView(moment, userId)) {
            throw new UnauthorizedAccessException("You don't have permission to save this moment");
        }

        // Create saved moment
        SavedMoment savedMoment = SavedMoment.builder()
                .user(user)
                .moment(moment)
                .build();

        savedMomentRepository.save(savedMoment);
        log.info("✅ Moment saved successfully");
    }

    /**
     * Unsave a moment for the user
     */
    @Transactional
    public void unsaveMoment(Long momentId, Long userId) {
        log.info("🗑️ unsaveMoment: momentId={}, userId={}", momentId, userId);

        // Check if saved
        if (!savedMomentRepository.existsByUserIdAndMomentId(userId, momentId)) {
            log.warn("⚠️ Moment {} not saved by user {}", momentId, userId);
            return; // Idempotent - do nothing if not saved
        }

        // Delete saved moment
        savedMomentRepository.deleteByUserIdAndMomentId(userId, momentId);
        log.info("✅ Moment unsaved successfully");
    }

    /**
     * Get saved moments for a user
     */
    @Transactional(readOnly = true)
    public Slice<MomentResponseDTO> getSavedMoments(Long userId, Pageable pageable) {
        log.info("📋 getSavedMoments: userId={}, pageable={}", userId, pageable);

        // Verify user exists
        if (!userRepository.existsById(userId)) {
            throw new IllegalArgumentException("User not found");
        }

        // Get saved moments
        Slice<SavedMoment> savedMoments = savedMomentRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable);

        // Map to MomentResponseDTO
        return savedMoments.map(savedMoment -> {
            Moment moment = savedMoment.getMoment();
            // Since user saved it, they have permission to view
            return toResponseDTO(moment, userId);
        });
    }

    /**
     * Check if a moment is saved by user
     */
    @Transactional(readOnly = true)
    public boolean isMomentSavedByUser(Long momentId, Long userId) {
        return savedMomentRepository.existsByUserIdAndMomentId(userId, momentId);
    }

    // ==================== USER ACTIVITY METHODS ====================

    /**
     * Get moments created by a specific user
     */
    @Transactional(readOnly = true)
    public Slice<MomentResponseDTO> getUserMoments(Long userId, Pageable pageable) {
        log.info("📋 getUserMoments: userId={}, page={}, size={}", userId, pageable.getPageNumber(), pageable.getPageSize());

        // Get moments by user, ordered by createdAt desc
        var momentsSlice = momentRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable);

        // Convert to DTOs
        var content = momentsSlice.getContent().stream()
                .map(moment -> toResponseDTO(moment, userId))
                .collect(Collectors.toList());

        return new org.springframework.data.domain.SliceImpl<>(content, pageable, momentsSlice.hasNext());
    }

    /**
     * Get reactions made by a specific user
     */
    @Transactional(readOnly = true)
    public org.springframework.data.domain.Page<Map<String, Object>> getUserReactions(Long userId, Pageable pageable) {
        log.info("📋 getUserReactions: userId={}, page={}, size={}", userId, pageable.getPageNumber(), pageable.getPageSize());

        // Get reactions by user, ordered by createdAt desc
        var reactionsList = momentReactionRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable);

        // Convert to response format
        var content = reactionsList.stream()
                .map(reaction -> {
                    Map<String, Object> reactionData = new HashMap<>();
                    reactionData.put("id", reaction.getId());
                    reactionData.put("momentId", reaction.getMoment().getId());
                    reactionData.put("momentCaption", reaction.getMoment().getCaption() != null ? reaction.getMoment().getCaption() : "No caption");
                    reactionData.put("momentImagePath", reaction.getMoment().getImagePath());
                    reactionData.put("reactionType", reaction.getReactionType().name());
                    reactionData.put("emoji", getReactionEmoji(reaction.getReactionType()));
                    reactionData.put("reactedAt", reaction.getCreatedAt());
                    return reactionData;
                })
                .collect(Collectors.toList());

        return new org.springframework.data.domain.PageImpl<>(content, pageable, content.size());
    }
}
