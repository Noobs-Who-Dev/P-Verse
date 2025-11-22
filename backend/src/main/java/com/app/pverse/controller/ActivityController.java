package com.app.pverse.controller;

import com.app.pverse.dto.ActivityItemDTO;
import com.app.pverse.dto.UserActivityStatsDTO;
import com.app.pverse.entity.User;
import com.app.pverse.service.ActivityService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/activity")
@RequiredArgsConstructor
public class ActivityController {

    private final ActivityService activityService;

    /**
     * Get user activity statistics
     * GET /api/activity/stats
     */
    @GetMapping("/stats")
    public ResponseEntity<UserActivityStatsDTO> getActivityStats(
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        User user = (User) userDetails;
        UserActivityStatsDTO stats = activityService.getUserActivityStats(user.getId());
        return ResponseEntity.ok(stats);
    }

    /**
     * Get recent activity items
     * GET /api/activity/recent?limit=20
     */
    @GetMapping("/recent")
    public ResponseEntity<List<ActivityItemDTO>> getRecentActivity(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(defaultValue = "20") int limit
    ) {
        User user = (User) userDetails;
        List<ActivityItemDTO> activities = activityService.getRecentActivity(user.getId(), limit);
        return ResponseEntity.ok(activities);
    }
}

