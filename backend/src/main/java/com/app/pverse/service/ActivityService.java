package com.app.pverse.service;

import com.app.pverse.dto.response.activity.ActivityItemDTO;
import com.app.pverse.dto.response.activity.UserActivityStatsDTO;
import com.app.pverse.entity.Moment;
import com.app.pverse.entity.MomentReaction;
import com.app.pverse.entity.User;
import com.app.pverse.repository.MomentReactionRepository;
import com.app.pverse.repository.MomentRepository;
import com.app.pverse.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ActivityService {

    private final MomentRepository momentRepository;
    private final MomentReactionRepository momentReactionRepository;
    private final UserRepository userRepository;

    /**
     * Get user activity statistics
     */
    public UserActivityStatsDTO getUserActivityStats(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Count posts/moments
        long totalPosts = momentRepository.countByUser(user);

        // Count reactions given by user
        long totalLikes = momentReactionRepository.countByUser(user);

        // Count comments (assuming you have Comment entity - for now we'll use 0)
        // TODO: Implement when Comment entity is available
        long totalComments = 0;

        // Calculate time spent (simplified - based on activity patterns)
        String timeSpentToday = calculateTimeSpent(user, 1);
        String timeSpentWeek = calculateTimeSpent(user, 7);

        UserActivityStatsDTO stats = new UserActivityStatsDTO();
        stats.setTotalPosts(totalPosts);
        stats.setTotalComments(totalComments);
        stats.setTotalLikes(totalLikes);
        stats.setTotalMoments(totalPosts); // Same as posts for now
        stats.setTimeSpentToday(timeSpentToday);
        stats.setTimeSpentWeek(timeSpentWeek);

        return stats;
    }

    /**
     * Get recent activity items
     */
    public List<ActivityItemDTO> getRecentActivity(Long userId, int limit) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<ActivityItemDTO> activities = new ArrayList<>();

        // Create pageable for limiting results
        Pageable pageable = PageRequest.of(0, 10);

        // Get recent posts/moments
        List<Moment> recentMoments = momentRepository.findTop10ByUserOrderByCreatedAtDesc(user, pageable);
        for (Moment moment : recentMoments) {
            ActivityItemDTO item = new ActivityItemDTO();
            item.setId(moment.getId());
            item.setType("post");
            item.setContent(moment.getCaption() != null && !moment.getCaption().isEmpty()
                    ? "Posted: \"" + moment.getCaption() + "\""
                    : "Shared a new photo");
            item.setTimestamp(moment.getCreatedAt());
            item.setTimeAgo(getTimeAgo(moment.getCreatedAt()));
            activities.add(item);
        }

        // Get recent reactions/likes
        List<MomentReaction> recentReactions = momentReactionRepository.findTop10ByUserOrderByCreatedAtDesc(user, pageable);
        for (MomentReaction reaction : recentReactions) {
            ActivityItemDTO item = new ActivityItemDTO();
            item.setId(reaction.getId());
            item.setType("like");
            item.setContent("Liked a post");
            item.setTimestamp(reaction.getCreatedAt());
            item.setTimeAgo(getTimeAgo(reaction.getCreatedAt()));

            // Add target user info
            User targetUser = reaction.getMoment().getUser();
            ActivityItemDTO.TargetUserDTO target = new ActivityItemDTO.TargetUserDTO();
            target.setId(targetUser.getId());
            target.setUsername(targetUser.getUsername());
            target.setDisplayName(targetUser.getDisplayName());
            target.setAvatarUrl(targetUser.getAvatarUrl());
            item.setTarget(target);

            activities.add(item);
        }

        // Sort by timestamp descending and limit
        return activities.stream()
                .sorted(Comparator.comparing(ActivityItemDTO::getTimestamp).reversed())
                .limit(limit)
                .collect(Collectors.toList());
    }

    /**
     * Calculate time spent based on activity patterns
     * Simplified: Average 2 minutes per post/reaction
     */
    private String calculateTimeSpent(User user, int days) {
        LocalDateTime startDate = LocalDateTime.now().minusDays(days);

        // Count activities in the period
        long postsCount = momentRepository.countByUserAndCreatedAtAfter(user, startDate);
        long reactionsCount = momentReactionRepository.countByUserAndCreatedAtAfter(user, startDate);

        // Estimate: 2 minutes per post, 0.5 minutes per reaction
        long totalMinutes = (postsCount * 2) + (reactionsCount / 2);

        long hours = totalMinutes / 60;
        long minutes = totalMinutes % 60;

        return hours + "h " + minutes + "m";
    }

    /**
     * Convert timestamp to "time ago" format
     */
    private String getTimeAgo(LocalDateTime timestamp) {
        if (timestamp == null) {
            return "Unknown";
        }

        LocalDateTime now = LocalDateTime.now();
        long minutes = ChronoUnit.MINUTES.between(timestamp, now);

        if (minutes < 1) {
            return "just now";
        } else if (minutes < 60) {
            return minutes + " minute" + (minutes > 1 ? "s" : "") + " ago";
        }

        long hours = ChronoUnit.HOURS.between(timestamp, now);
        if (hours < 24) {
            return hours + " hour" + (hours > 1 ? "s" : "") + " ago";
        }

        long days = ChronoUnit.DAYS.between(timestamp, now);
        if (days < 7) {
            return days + " day" + (days > 1 ? "s" : "") + " ago";
        }

        long weeks = days / 7;
        if (weeks < 4) {
            return weeks + " week" + (weeks > 1 ? "s" : "") + " ago";
        }

        long months = days / 30;
        return months + " month" + (months > 1 ? "s" : "") + " ago";
    }
}

