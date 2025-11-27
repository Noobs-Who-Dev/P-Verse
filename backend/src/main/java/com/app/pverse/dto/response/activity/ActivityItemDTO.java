package com.app.pverse.dto.response.activity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ActivityItemDTO {
    private Long id;
    private String type; // post, comment, like, moment
    private String content;
    private LocalDateTime timestamp;
    private String timeAgo;

    // Target user info (for likes, comments)
    private TargetUserDTO target;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TargetUserDTO {
        private Long id;
        private String username;
        private String displayName;
        private String avatarUrl;
    }
}

