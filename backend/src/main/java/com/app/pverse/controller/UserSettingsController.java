package com.app.pverse.controller;

import com.app.pverse.dto.request.UpdateSettingsRequest;
import com.app.pverse.dto.response.ApiResponse;
import com.app.pverse.dto.response.UserSettingsDto;
import com.app.pverse.entity.UserSettings;
import com.app.pverse.service.UserSettingsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserSettingsController {
    private final UserSettingsService settingsService;

    /**
     * Get user settings
     * GET /api/users/{userId}/settings
     */
    @GetMapping("/{userId}/settings")
    public ResponseEntity<UserSettingsDto> getSettings(@PathVariable Long userId) {
        return ResponseEntity.ok(settingsService.getSettings(userId));
    }

    /**
     * Update all settings at once
     * PUT /api/users/{userId}/settings
     */
    @PutMapping("/{userId}/settings")
    public ResponseEntity<UserSettingsDto> updateSettings(
            @PathVariable Long userId,
            @RequestBody UpdateSettingsRequest request) {
        return ResponseEntity.ok(settingsService.updateSettings(userId, request));
    }

    /**
     * Update theme only
     * PUT /api/users/{userId}/settings/theme?theme=DARK
     */
    @PutMapping("/{userId}/settings/theme")
    public ResponseEntity<ApiResponse<UserSettingsDto>> updateTheme(
            @PathVariable Long userId,
            @RequestParam String theme) {
        UpdateSettingsRequest request = new UpdateSettingsRequest();
        request.setTheme(UserSettings.Theme.valueOf(theme.toUpperCase()));
        UserSettingsDto updated = settingsService.updateSettings(userId, request);
        return ResponseEntity.ok(ApiResponse.success("Theme updated successfully", updated));
    }

    /**
     * Update language only
     * PUT /api/users/{userId}/settings/language?language=EN
     */
    @PutMapping("/{userId}/settings/language")
    public ResponseEntity<ApiResponse<UserSettingsDto>> updateLanguage(
            @PathVariable Long userId,
            @RequestParam String language) {
        UpdateSettingsRequest request = new UpdateSettingsRequest();
        request.setLanguage(UserSettings.Language.valueOf(language.toUpperCase()));
        UserSettingsDto updated = settingsService.updateSettings(userId, request);
        return ResponseEntity.ok(ApiResponse.success("Language updated successfully", updated));
    }

    /**
     * Toggle notifications
     * PUT /api/users/{userId}/settings/notifications
     */
    @PutMapping("/{userId}/settings/notifications")
    public ResponseEntity<ApiResponse<UserSettingsDto>> toggleNotifications(@PathVariable Long userId) {
        UserSettingsDto updated = settingsService.toggleNotifications(userId);
        return ResponseEntity.ok(ApiResponse.success("Notifications toggled successfully", updated));
    }
}
