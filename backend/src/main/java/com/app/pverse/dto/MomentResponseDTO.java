package com.app.pverse.dto;

import com.app.pverse.entity.Moment.Visibility;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Response DTO cho Moment
 * Không expose sensitive user information
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MomentResponseDTO {

    private Long id;

    /**
     * Owner của moment - chỉ expose thông tin public
     */
    private UserSummaryDTO user;

    private String caption;

    private String imagePath;

    private Visibility visibility;

    /**
     * User được share riêng (chỉ hiện nếu visibility = SPECIFIC_PERSON)
     */
    private UserSummaryDTO specificUser;

    private LocalDateTime createdAt;

    /**
     * Metadata - có thể thêm từ service layer
     */
    private Long reactionCount;

    private Boolean hasReacted; // Current user đã react chưa

    private String reactionType; // Loại reaction của current user (if any)

    private Boolean isSaved; // Current user đã save moment này chưa

    /**
     * Helper để frontend format time
     * Examples: "2 hours ago", "1 day ago"
     */
    private String timeAgo;
}