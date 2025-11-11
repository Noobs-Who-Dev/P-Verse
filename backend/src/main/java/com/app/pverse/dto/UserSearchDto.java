package com.app.pverse.dto;

import com.app.pverse.entity.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserSearchDto {
    private Long id;
    private String username;
    private String email;
    private String displayName;
    private String avatarUrl;
    private Boolean isOnline;
    private LocalDateTime lastSeenAt;

    // Trạng thái quan hệ với viewer
    private FriendshipStatusDto friendshipStatus;

    public enum FriendshipStatusDto {
        FRIEND,           // Đã là bạn bè (accepted)
        PENDING_SENT,     // Đã gửi lời mời kết bạn (chờ họ accept)
        PENDING_RECEIVED, // Nhận được lời mời kết bạn (chờ mình accept)
        STRANGER,         // Người lạ (chưa có quan hệ gì)
        BLOCKED           // Đã bị block hoặc đã block
    }

    /**
     * Convert từ User entity sang DTO
     */
    public static UserSearchDto fromEntity(User user, FriendshipStatusDto status) {
        return UserSearchDto.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .displayName(user.getDisplayName())
                .avatarUrl(user.getAvatarUrl())
                .isOnline(user.getIsOnline())
                .lastSeenAt(user.getLastSeenAt())
                .friendshipStatus(status)
                .build();
    }
}