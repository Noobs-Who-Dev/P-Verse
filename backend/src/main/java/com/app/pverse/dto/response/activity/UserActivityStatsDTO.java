package com.app.pverse.dto.response.activity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserActivityStatsDTO {
    private long totalPosts;
    private long totalComments;
    private long totalLikes;
    private String timeSpentToday;
    private String timeSpentWeek;
    private long totalMoments;
}

