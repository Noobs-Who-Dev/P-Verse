package com.app.pverse.controller;

import com.app.pverse.dto.response.ApiResponse;
import com.app.pverse.dto.response.UserStatusDto;
import com.app.pverse.entity.User;
import com.app.pverse.entity.UserStatus;
import com.app.pverse.service.UserStatusService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * REST API Controller cho User Status
 */
@RestController
@RequestMapping("/api/user-status")
@RequiredArgsConstructor
public class UserStatusController {

    private final UserStatusService userStatusService;

    /**
     * Lấy status của user hiện tại
     */
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserStatusDto>> getMyStatus(@AuthenticationPrincipal User user) {
        UserStatusDto status = userStatusService.getUserStatus(user.getId());
        return ResponseEntity.ok(ApiResponse.success(status));
    }

    /**
     * Lấy status của một user cụ thể
     */
    @GetMapping("/{userId}")
    public ResponseEntity<ApiResponse<UserStatusDto>> getUserStatus(@PathVariable Long userId) {
        UserStatusDto status = userStatusService.getUserStatus(userId);
        return ResponseEntity.ok(ApiResponse.success(status));
    }

    /**
     * Lấy status của nhiều users
     */
    @PostMapping("/batch")
    public ResponseEntity<ApiResponse<List<UserStatusDto>>> getUsersStatus(@RequestBody List<Long> userIds) {
        List<UserStatusDto> statuses = userStatusService.getUsersStatus(userIds);
        return ResponseEntity.ok(ApiResponse.success(statuses));
    }

    /**
     * Cập nhật status của user hiện tại
     */
    @PutMapping("/me")
    public ResponseEntity<ApiResponse<UserStatusDto>> updateMyStatus(
            @AuthenticationPrincipal User user,
            @RequestBody Map<String, String> request) {

        String statusStr = request.get("status");
        UserStatus newStatus = UserStatus.valueOf(statusStr.toUpperCase());

        userStatusService.updateUserStatus(user.getId(), newStatus);
        UserStatusDto updatedStatus = userStatusService.getUserStatus(user.getId());

        return ResponseEntity.ok(ApiResponse.success("Cập nhật status thành công", updatedStatus));
    }

    /**
     * Đánh dấu user đang hoạt động (reset OFFLINE timer)
     */
    @PostMapping("/activity")
    public ResponseEntity<ApiResponse<Void>> recordActivity(@AuthenticationPrincipal User user) {
        userStatusService.updateUserActivity(user.getId());
        return ResponseEntity.ok(ApiResponse.success("Ghi nhận hoạt động thành công", null));
    }

    /**
     * Set user ONLINE
     */
    @PostMapping("/online")
    public ResponseEntity<ApiResponse<Void>> setOnline(@AuthenticationPrincipal User user) {
        userStatusService.setUserOnline(user.getId());
        return ResponseEntity.ok(ApiResponse.success("Đã chuyển sang ONLINE", null));
    }


    /**
     * Set user OFFLINE
     */
    @PostMapping("/offline")
    public ResponseEntity<ApiResponse<Void>> setOffline(@AuthenticationPrincipal User user) {
        userStatusService.setUserOffline(user.getId());
        return ResponseEntity.ok(ApiResponse.success("Đã chuyển sang OFFLINE", null));
    }
}

