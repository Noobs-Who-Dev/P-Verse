package com.app.pverse.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileDto {
    private UserDto user;
    private ProfileStatsDto stats;
    private Boolean isOwnProfile;  // Check xem co phai profile cua minh khong
    private String relationshipStatus;  // "FRIEND", "STRANGER", "PENDING_SENT", etc.
}
