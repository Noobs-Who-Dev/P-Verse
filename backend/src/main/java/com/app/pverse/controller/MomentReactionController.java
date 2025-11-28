package com.app.pverse.controller;

import com.app.pverse.dto.response.ApiResponse;
import com.app.pverse.entity.MomentReaction;
import com.app.pverse.entity.User;
import com.app.pverse.service.MomentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Controller for moment reactions
 */
@RestController
@RequestMapping("/api/moments")
@RequiredArgsConstructor
@Slf4j
public class MomentReactionController {

    private final MomentService momentService;

    /**
     * Add or update reaction to a moment
     * POST /api/moments/{momentId}/reactions
     * Body: { "reactionType": "LIKE" }
     */
    @PostMapping("/{momentId}/reactions")
    public ResponseEntity<ApiResponse<Map<String, Object>>> addReaction(
            @PathVariable Long momentId,
            @RequestBody Map<String, String> request,
            @AuthenticationPrincipal User currentUser
    ) {
        Long userId = currentUser != null ? currentUser.getId() : 1L;
        String reactionTypeStr = request.get("reactionType");

        log.info("========================================");
        log.info("📥 POST /api/moments/{}/reactions", momentId);
        log.info("   userId: {}", userId);
        log.info("   reactionType: {}", reactionTypeStr);

        try {
            // Parse reaction type
            MomentReaction.ReactionType reactionType = MomentReaction.ReactionType.valueOf(reactionTypeStr);

            // Add or toggle reaction
            Map<String, Object> result = momentService.addOrToggleReaction(momentId, userId, reactionType);

            log.info("✅ Reaction processed: {}", result.get("action"));
            log.info("========================================");

            return ResponseEntity.ok(ApiResponse.success(result));

        } catch (IllegalArgumentException e) {
            log.error("❌ Invalid reaction type: {}", reactionTypeStr);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Invalid reaction type: " + reactionTypeStr));
        } catch (Exception e) {
            log.error("❌ Error processing reaction", e);
            log.error("========================================");
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Failed to process reaction: " + e.getMessage()));
        }
    }

    /**
     * Get current user's reaction for a moment
     * GET /api/moments/{momentId}/reactions/me
     */
    @GetMapping("/{momentId}/reactions/me")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getMyReaction(
            @PathVariable Long momentId,
            @AuthenticationPrincipal User currentUser
    ) {
        Long userId = currentUser != null ? currentUser.getId() : 1L;

        log.info("📋 GET /api/moments/{}/reactions/me - userId: {}", momentId, userId);

        try {
            Map<String, Object> reaction = momentService.getUserReaction(momentId, userId);

            if (reaction.isEmpty()) {
                return ResponseEntity.noContent().build();
            }

            return ResponseEntity.ok(ApiResponse.success(reaction));

        } catch (Exception e) {
            log.error("❌ Error getting user reaction", e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Failed to get reaction: " + e.getMessage()));
        }
    }

    /**
     * Remove reaction from a moment
     * DELETE /api/moments/{momentId}/reactions
     */
    @DeleteMapping("/{momentId}/reactions")
    public ResponseEntity<ApiResponse<Void>> removeReaction(
            @PathVariable Long momentId,
            @AuthenticationPrincipal User currentUser
    ) {
        Long userId = currentUser != null ? currentUser.getId() : 1L;

        log.info("🗑️ DELETE /api/moments/{}/reactions - userId: {}", momentId, userId);

        try {
            momentService.removeReaction(momentId, userId);
            log.info("✅ Reaction removed");
            return ResponseEntity.ok(ApiResponse.success(null));

        } catch (Exception e) {
            log.error("❌ Error removing reaction", e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Failed to remove reaction: " + e.getMessage()));
        }
    }

    /**
     * Get recent reactions for a moment (for Activity button)
     * GET /api/moments/{momentId}/reactions/recent
     */
    @GetMapping("/{momentId}/reactions/recent")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getRecentReactions(
            @PathVariable Long momentId,
            @AuthenticationPrincipal User currentUser
    ) {
        log.info("📋 GET /api/moments/{}/reactions/recent", momentId);

        try {
            Map<String, Object> result = momentService.getRecentReactions(momentId);
            return ResponseEntity.ok(ApiResponse.success(result));

        } catch (Exception e) {
            log.error("❌ Error getting recent reactions", e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Failed to get recent reactions: " + e.getMessage()));
        }
    }

    /**
     * Get activity data for a moment (views and reactions)
     * GET /api/moments/{momentId}/activity
     */
    @GetMapping("/{momentId}/activity")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getMomentActivity(
            @PathVariable Long momentId,
            @AuthenticationPrincipal User currentUser
    ) {
        log.info("📋 GET /api/moments/{}/activity", momentId);

        try {
            Map<String, Object> result = momentService.getMomentActivity(momentId);
            return ResponseEntity.ok(ApiResponse.success(result));

        } catch (Exception e) {
            log.error("❌ Error getting moment activity", e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Failed to get moment activity: " + e.getMessage()));
        }
    }
}
