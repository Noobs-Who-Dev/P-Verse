package com.app.pverse.controller;

import com.app.pverse.dto.request.UpdateSettingsRequest;
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

    @GetMapping("/{userId}/settings")
    public ResponseEntity<UserSettingsDto> getSettings(@PathVariable Long userId) {
        return ResponseEntity.ok(settingsService.getSettings(userId));
    }

    @PutMapping("/{userId}/settings")
    public ResponseEntity<UserSettingsDto> updateSettings(
            @PathVariable Long userId,
            @RequestBody UpdateSettingsRequest request) {
        return ResponseEntity.ok(settingsService.updateSettings(userId, request));
    }

    @PatchMapping("/{userId}/settings/theme")
    public ResponseEntity<UserSettingsDto> updateTheme(
            @PathVariable Long userId,
            @RequestParam String theme) {
        UpdateSettingsRequest request = new UpdateSettingsRequest();
        request.setTheme(UserSettings.Theme.valueOf(theme.toUpperCase()));
        return ResponseEntity.ok(settingsService.updateSettings(userId, request));
    }

    @PatchMapping("/{userId}/settings/language")
    public ResponseEntity<UserSettingsDto> updateLanguage(
            @PathVariable Long userId,
            @RequestParam String language) {
        UpdateSettingsRequest request = new UpdateSettingsRequest();
        request.setLanguage(UserSettings.Language.valueOf(language.toUpperCase()));
        return ResponseEntity.ok(settingsService.updateSettings(userId, request));
    }

    @PatchMapping("/{userId}/settings/notifications")
    public ResponseEntity<UserSettingsDto> toggleNotifications(
            @PathVariable Long userId,
            @RequestParam Boolean notificationsEnabled) {
        UpdateSettingsRequest request = new UpdateSettingsRequest();
        request.setNotificationsEnabled(notificationsEnabled);
        return ResponseEntity.ok(settingsService.updateSettings(userId, request));
    }
}
