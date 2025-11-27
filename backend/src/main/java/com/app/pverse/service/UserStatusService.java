package com.app.pverse.service;

import com.app.pverse.dto.response.user.UserStatusDto;
import com.app.pverse.entity.User;
import com.app.pverse.entity.UserStatus;
import com.app.pverse.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service quản lý User Status
 * Xử lý logic cho ONLINE, OFFLINE status
 */
@Service
@RequiredArgsConstructor
public class UserStatusService {

    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;

    // Thời gian để chuyển từ ONLINE sang OFFLINE (5 phút)
    private static final long OFFLINE_THRESHOLD_MINUTES = 5;

    /**
     * Cập nhật status của user
     */
    @Transactional
    public void updateUserStatus(Long userId, UserStatus newStatus) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User không tồn tại"));

        UserStatus oldStatus = user.getStatus();
        user.setStatus(newStatus);
        user.setLastActivityAt(LocalDateTime.now());

        // Cập nhật isOnline và lastSeenAt
        if (newStatus == UserStatus.ONLINE) {
            user.setIsOnline(true);
        } else {
            user.setIsOnline(false);
            user.setLastSeenAt(LocalDateTime.now());
        }

        userRepository.save(user);

        // Broadcast status change nếu có thay đổi
        if (oldStatus != newStatus) {
            broadcastStatusChange(user);
        }
    }

    /**
     * Cập nhật hoạt động gần nhất của user
     * Dùng để reset timer OFFLINE
     */
    @Transactional
    public void updateUserActivity(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User không tồn tại"));

        user.setLastActivityAt(LocalDateTime.now());

        // Nếu user đang OFFLINE, chuyển về ONLINE
        if (user.getStatus() == UserStatus.OFFLINE) {
            user.setStatus(UserStatus.ONLINE);
            userRepository.save(user);
            broadcastStatusChange(user);
        } else if (user.getStatus() == UserStatus.ONLINE) {
            userRepository.save(user);
        }
    }

    /**
     * Đánh dấu user là ONLINE khi đăng nhập
     */
    @Transactional
    public void setUserOnline(Long userId) {
        updateUserStatus(userId, UserStatus.ONLINE);
    }

    /**
     * Đánh dấu user là OFFLINE khi đăng xuất
     */
    @Transactional
    public void setUserOffline(Long userId) {
        updateUserStatus(userId, UserStatus.OFFLINE);
    }


    /**
     * Lấy status của user
     */
    @Transactional(readOnly = true)
    public UserStatusDto getUserStatus(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User không tồn tại"));

        return toStatusDto(user);
    }

    /**
     * Lấy status của nhiều users
     */
    @Transactional(readOnly = true)
    public List<UserStatusDto> getUsersStatus(List<Long> userIds) {
        return userRepository.findAllById(userIds).stream()
                .map(this::toStatusDto)
                .collect(Collectors.toList());
    }

    /**
     * Tự động chuyển ONLINE sang OFFLINE nếu không có hoạt động
     * Được gọi định kỳ bởi scheduled task
     */
    @Transactional
    public void checkAndUpdateOfflineStatus() {
        LocalDateTime offlineThreshold = LocalDateTime.now().minusMinutes(OFFLINE_THRESHOLD_MINUTES);

        List<User> onlineUsers = userRepository.findByStatus(UserStatus.ONLINE);

        for (User user : onlineUsers) {
            if (user.getLastActivityAt() != null && user.getLastActivityAt().isBefore(offlineThreshold)) {
                user.setStatus(UserStatus.OFFLINE);
                user.setLastSeenAt(LocalDateTime.now());
                userRepository.save(user);
                broadcastStatusChange(user);
            }
        }
    }

    /**
     * Broadcast status change qua WebSocket
     */
    private void broadcastStatusChange(User user) {
        UserStatusDto statusDto = toStatusDto(user);

        // Broadcast to all users
        messagingTemplate.convertAndSend("/topic/user-status", statusDto);

        System.out.println("📡 Broadcasted status change: " + user.getUsername() + " -> " + user.getStatus());
    }

    /**
     * Convert User to UserStatusDto
     */
    private UserStatusDto toStatusDto(User user) {
        return UserStatusDto.builder()
                .userId(user.getId())
                .username(user.getUsername())
                .displayName(user.getDisplayName())
                .avatarUrl(user.getAvatarUrl())
                .status(user.getStatus())
                .lastSeenAt(user.getLastSeenAt())
                .lastActivityAt(user.getLastActivityAt())
                .build();
    }
}

