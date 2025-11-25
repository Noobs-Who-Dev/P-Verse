package com.app.pverse.service;

import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * Scheduled tasks để quản lý User Status
 */
@Component
@RequiredArgsConstructor
public class UserStatusScheduler {

    private final UserStatusService userStatusService;

    /**
     * Chạy mỗi 1 phút để kiểm tra và cập nhật OFFLINE status
     */
    @Scheduled(fixedRate = 60000) // 60 seconds
    public void checkOfflineStatus() {
        try {
            userStatusService.checkAndUpdateOfflineStatus();
        } catch (Exception e) {
            System.err.println("Error checking offline status: " + e.getMessage());
        }
    }
}

