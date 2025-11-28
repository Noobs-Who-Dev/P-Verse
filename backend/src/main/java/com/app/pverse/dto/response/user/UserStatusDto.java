package com.app.pverse.dto.response.user;

import com.app.pverse.entity.UserStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO cho User Status
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserStatusDto {
    private Long userId;
    private String username;
    private String displayName;
    private String avatarUrl;
    private UserStatus status;
    private LocalDateTime lastSeenAt;
    private LocalDateTime lastActivityAt;
}

