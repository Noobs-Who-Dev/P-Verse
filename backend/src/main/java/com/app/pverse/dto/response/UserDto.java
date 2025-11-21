package com.app.pverse.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserDto {
    private Long id;
    private String username;
    private String email;
    private String displayName;
    private String phoneNumber;
    private String avatarUrl;
    private String bio;
    private Boolean isOnline;
    private LocalDateTime lastSeenAt;
    private LocalDateTime createdAt;
}
