package com.app.pverse.controller;

import com.app.pverse.dto.FriendRequestDto;
import com.app.pverse.dto.UserSearchDto;
import com.app.pverse.service.FriendService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/friends")
@RequiredArgsConstructor
@Slf4j
public class FriendController {

    private final FriendService friendService;

    /**
     * Test endpoint
     */
    @GetMapping("/test")
    public ResponseEntity<Map<String, String>> test() {
        log.info("Test endpoint called");
        return ResponseEntity.ok(Map.of(
                "status", "OK",
                "message", "Backend is working!",
                "timestamp", java.time.LocalDateTime.now().toString()
        ));
    }

    /**
     * Tìm kiếm users theo keyword
     * GET /api/friends/search?keyword=john
     * Empty keyword returns all users (for suggestions)
     */
    @GetMapping("/search")
    public ResponseEntity<List<UserSearchDto>> searchUsers(
            @RequestParam(required = false, defaultValue = "") String keyword,
            @RequestAttribute(value = "userId", required = true) Long viewerId) {

        log.info("Search users API called: keyword={}, viewerId={}", keyword, viewerId);


        try {
            List<UserSearchDto> results = friendService.searchUsers(keyword, viewerId);
            log.info("Found {} users", results.size());
            return ResponseEntity.ok(results);

        } catch (Exception e) {
            log.error("Search error", e);
            return ResponseEntity.status(500).body(List.of());
        }
    }

    /**
     * Toggle friend request (Add/Cancel)
     * POST /api/friends/request
     */
    @PostMapping("/request")
    public ResponseEntity<Map<String, Object>> toggleFriendRequest(
            @Valid @RequestBody FriendRequestDto request,
            @RequestAttribute(value = "userId", required = true) Long viewerId) {

        log.info("Toggle friend request API: viewer={}, target={}",
                viewerId, request.getTargetUserId());

        try {
            UserSearchDto.FriendshipStatusDto newStatus =
                    friendService.toggleFriendRequest(viewerId, request.getTargetUserId());

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("newStatus", newStatus);
            response.put("message", getStatusMessage(newStatus));

            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {
            log.error("Invalid request: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "error", e.getMessage()));

        } catch (IllegalStateException e) {
            log.error("Invalid state: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("success", false, "error", e.getMessage()));
        }
    }

    /**
     * Unfriend
     * DELETE /api/friends/{targetUserId}
     */
    @DeleteMapping("/{targetUserId}")
    public ResponseEntity<Map<String, Object>> unfriend(
            @PathVariable Long targetUserId,
            @RequestAttribute(value = "userId", required = true) Long viewerId) {

        log.info("Unfriend API: viewer={}, target={}", viewerId, targetUserId);

        try {
            friendService.unfriend(viewerId, targetUserId);

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Unfriended successfully"
            ));

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "error", e.getMessage()));

        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("success", false, "error", e.getMessage()));
        }
    }

    /**
     * Lấy danh sách bạn bè
     * GET /api/friends
     */
    @GetMapping
    public ResponseEntity<List<UserSearchDto>> getFriends(
            @RequestAttribute(value = "userId", required = true) Long userId) {

        log.info("Get friends list API: userId={}", userId);

        try {
            List<UserSearchDto> friends = friendService.getFriends(userId);
            return ResponseEntity.ok(friends);
        } catch (Exception e) {
            log.error("Error getting friends", e);
            return ResponseEntity.status(500).body(List.of());
        }
    }

    /**
     * Lấy danh sách friend requests đã nhận
     * GET /api/friends/requests/received
     */
    @GetMapping("/requests/received")
    public ResponseEntity<List<UserSearchDto>> getReceivedRequests(
            @RequestAttribute(value = "userId", required = true) Long userId) {

        log.info("Get received requests API: userId={}", userId);

        try {
            List<UserSearchDto> requests = friendService.getReceivedRequests(userId);
            return ResponseEntity.ok(requests);
        } catch (Exception e) {
            log.error("Error getting received requests", e);
            return ResponseEntity.status(500).body(List.of());
        }
    }

    /**
     * Lấy danh sách friend requests đã gửi
     * GET /api/friends/requests/sent
     */
    @GetMapping("/requests/sent")
    public ResponseEntity<List<UserSearchDto>> getSentRequests(
            @RequestAttribute(value = "userId", required = true) Long userId) {

        log.info("Get sent requests API: userId={}", userId);

        try {
            List<UserSearchDto> requests = friendService.getSentRequests(userId);
            return ResponseEntity.ok(requests);
        } catch (Exception e) {
            log.error("Error getting sent requests", e);
            return ResponseEntity.status(500).body(List.of());
        }
    }

    /**
     * Helper: Tạo message dựa trên status
     */
    private String getStatusMessage(UserSearchDto.FriendshipStatusDto status) {
        return switch (status) {
            case PENDING_SENT -> "Friend request sent successfully";
            case STRANGER -> "Friend request cancelled";
            case FRIEND -> "Friend request accepted";
            default -> "Status updated";
        };
    }
}