package com.app.pverse.controller;

import com.app.pverse.dto.MomentResponseDTO;
import com.app.pverse.dto.CursorPage;
import com.app.pverse.dto.request.CreateMomentRequest;
import com.app.pverse.dto.response.ApiResponse;
import com.app.pverse.entity.Moment.Visibility;
import com.app.pverse.entity.User;
import com.app.pverse.exception.MomentNotFoundException;
import com.app.pverse.exception.UnauthorizedAccessException;
import com.app.pverse.service.MomentService;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.Map;

/**
 * Controller cho Moment features
 */
@RestController
@RequestMapping("/api/moments")
@RequiredArgsConstructor
@Slf4j
public class MomentController {

    private final MomentService momentService;
    private final ObjectMapper objectMapper;

    /**
     * TEST ENDPOINT - Verify moment API is working
     * GET /api/moments/test
     */
    @GetMapping("/test")
    public ResponseEntity<ApiResponse<String>> test() {
        String message = "✅ Moment API is working! Time: " + java.time.LocalDateTime.now();
        log.info(message);
        return ResponseEntity.ok(ApiResponse.success(message));
    }

    /**
     * TEST ENDPOINT - Verify file upload is working
     * POST /api/moments/test-upload
     */
    @PostMapping("/test-upload")
    public ResponseEntity<ApiResponse<Map<String, Object>>> testUpload(
            @RequestPart("image") MultipartFile image) {

        log.info("===== TEST UPLOAD =====");
        log.info("Filename: {}", image.getOriginalFilename());
        log.info("Size: {} bytes", image.getSize());
        log.info("Content-Type: {}", image.getContentType());
        log.info("=====================");

        Map<String, Object> responseData = new HashMap<>();
        responseData.put("filename", image.getOriginalFilename());
        responseData.put("size", image.getSize());
        responseData.put("contentType", image.getContentType());
        responseData.put("isEmpty", image.isEmpty());
        responseData.put("timestamp", java.time.LocalDateTime.now());

        return ResponseEntity.ok(ApiResponse.success(responseData));
    }

    /**
     * Tạo moment mới
     * POST /api/moments
     */
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<MomentResponseDTO>> createMoment(
            @RequestPart("image") MultipartFile image,
            @RequestPart(value = "caption", required = false) String caption,
            @RequestPart("visibility") String visibilityStr,
            @RequestPart(value = "specificUserId", required = false) String specificUserIdStr,
            @AuthenticationPrincipal User currentUser) {

        log.info("===== CREATE MOMENT REQUEST =====");
        log.info("Image: {} ({} bytes, {})",
                image.getOriginalFilename(),
                image.getSize(),
                image.getContentType());
        log.info("Caption length: {}", caption != null ? caption.length() : 0);
        log.info("Visibility: {}", visibilityStr);
        log.info("SpecificUserId: {}", specificUserIdStr);
        log.info("CurrentUser: {}", currentUser != null ? currentUser.getId() : "NULL");
        log.info("=================================");

        try {
            // CRITICAL FIX: Handle null currentUser (no authentication)
            Long userId;
            if (currentUser == null) {
                // TEMPORARY FALLBACK for development/testing
                log.warn("⚠️ No authentication detected! Using fallback user ID.");
                log.warn("⚠️ This should ONLY happen in development. Enable auth in production!");
                userId = 1L; // TEMPORARY - Remove in production
            } else {
                userId = currentUser.getId();
            }

            // Parse visibility
            Visibility visibility = Visibility.valueOf(visibilityStr.toUpperCase());

            // Parse specificUserId if provided
            Long specificUserId = null;
            if (specificUserIdStr != null && !specificUserIdStr.isEmpty()) {
                specificUserId = Long.parseLong(specificUserIdStr);
            }

            // Create request object
            CreateMomentRequest request = CreateMomentRequest.builder()
                    .caption(caption)
                    .visibility(visibility)
                    .specificUserId(specificUserId)
                    .build();

            // Create moment
            MomentResponseDTO response = momentService.createMoment(request, image, userId);

            log.info("✅ Moment created successfully with ID: {}", response.getId());

            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(ApiResponse.success("Moment created successfully", response));

        } catch (IllegalArgumentException e) {
            log.error("Invalid request parameters", e);
            return ResponseEntity
                    .badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            log.error("Error creating moment", e);
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to create moment: " + e.getMessage()));
        }
    }

    /**
     * Lấy moment theo ID
     * GET /api/moments/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<MomentResponseDTO>> getMomentById(
            @PathVariable Long id,
            @AuthenticationPrincipal User currentUser) {

        log.info("Getting moment: {} by user: {}", id, currentUser != null ? currentUser.getId() : "NULL");

        try {
            Long userId = currentUser != null ? currentUser.getId() : 1L;
            MomentResponseDTO response = momentService.getMomentById(id, userId);
            return ResponseEntity.ok(ApiResponse.success(response));
        } catch (Exception e) {
            log.error("Error getting moment", e);
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Lấy feed moments với filter (ALL, FRIENDS, MINE)
     * GET /api/moments/feed?filter=all&page=0&size=20
     */
    @GetMapping("/feed")
    public ResponseEntity<ApiResponse<Slice<MomentResponseDTO>>> getFeed(
            @RequestParam(defaultValue = "all") String filter,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @AuthenticationPrincipal User currentUser) {

        Long userId = currentUser != null ? currentUser.getId() : 1L;
        log.info("Getting moment feed for user: {}, filter: {}, page: {}, size: {}",
                userId, filter, page, size);

        try {
            // Parse filter
            MomentService.FeedFilter feedFilter;
            try {
                feedFilter = MomentService.FeedFilter.valueOf(filter.toUpperCase());
            } catch (IllegalArgumentException e) {
                log.warn("Invalid filter: {}, defaulting to ALL", filter);
                feedFilter = MomentService.FeedFilter.ALL;
            }

            Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
            Slice<MomentResponseDTO> response = momentService.getFeedWithFilter(userId, feedFilter, pageable);

            return ResponseEntity.ok(ApiResponse.success(response));
        } catch (Exception e) {
            log.error("Error getting moment feed", e);
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to get moment feed: " + e.getMessage()));
        }
    }

    /**
     * Lấy moments của một user
     * GET /api/moments/users/{userId}?page=0&size=20
     */
    @GetMapping("/users/{userId}")
    public ResponseEntity<ApiResponse<Slice<MomentResponseDTO>>> getUserMoments(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @AuthenticationPrincipal User currentUser) {

        Long viewerId = currentUser != null ? currentUser.getId() : 1L;
        log.info("Getting moments for user: {} by viewer: {}, page: {}, size: {}", userId, viewerId, page, size);

        try {
            Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
            Slice<MomentResponseDTO> response = momentService.getUserMoments(userId, viewerId, pageable);
            return ResponseEntity.ok(ApiResponse.success(response));
        } catch (Exception e) {
            log.error("Error getting user moments", e);
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to get user moments: " + e.getMessage()));
        }
    }

    /**
     * Lấy feed moments với cursor-based pagination (Infinite scroll)
     * GET /api/moments/feed/cursor?cursor={base64}&limit=20
     */
    @GetMapping("/feed/cursor")
    public ResponseEntity<ApiResponse<CursorPage<MomentResponseDTO>>> getFeedWithCursor(
            @RequestParam(required = false) String cursor,
            @RequestParam(defaultValue = "20") int limit,
            @AuthenticationPrincipal User currentUser) {

        Long userId = currentUser != null ? currentUser.getId() : 1L;
        log.info("Getting moment feed with cursor for user: {}, cursor: {}, limit: {}", userId, cursor, limit);

        try {
            CursorPage<MomentResponseDTO> response = momentService.getFeedWithCursor(userId, cursor, limit);
            return ResponseEntity.ok(ApiResponse.success(response));
        } catch (IllegalArgumentException e) {
            log.error("Invalid cursor", e);
            return ResponseEntity
                    .badRequest()
                    .body(ApiResponse.error("Invalid cursor: " + e.getMessage()));
        } catch (Exception e) {
            log.error("Error getting moment feed with cursor", e);
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to get moment feed: " + e.getMessage()));
        }
    }

    /**
     * Xóa moment (chỉ owner)
     * DELETE /api/moments/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteMoment(
            @PathVariable Long id,
            @AuthenticationPrincipal User currentUser) {

        Long userId = currentUser != null ? currentUser.getId() : 1L;
        log.info("Deleting moment: {} by user: {}", id, userId);

        try {
            momentService.deleteMoment(id, userId);
            return ResponseEntity.ok(ApiResponse.success("Moment deleted successfully", null));
        } catch (MomentNotFoundException e) {
            log.error("Moment not found", e);
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (UnauthorizedAccessException e) {
            log.error("Unauthorized access", e);
            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            log.error("Error deleting moment", e);
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to delete moment: " + e.getMessage()));
        }
    }
}





