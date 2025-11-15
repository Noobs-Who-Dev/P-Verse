package com.app.pverse.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProfileStatsDto {
    private Long userId;
    private Integer postsCount;
    private Integer followersCount;
    private Integer followingCount;
}

