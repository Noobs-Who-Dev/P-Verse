package com.app.pverse.service;

import com.app.pverse.dto.request.UpdateSettingsRequest;
import com.app.pverse.dto.response.UserSettingsDto;
import com.app.pverse.entity.UserSettings;
import com.app.pverse.repository.UserSettingsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class UserSettingsService {
    private final UserSettingsRepository settingsRepository;

    @Transactional(readOnly = true)
    public UserSettingsDto getSettings(Long userId) {
        UserSettings settings = settingsRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Settings không tồn tại"));
        return toDto(settings);
    }

    public UserSettingsDto updateSettings(Long userId, UpdateSettingsRequest request) {
        UserSettings settings = settingsRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Settings không tồn tại"));

        if (request.getTheme() != null) {
            settings.setTheme(request.getTheme());
        }
        if (request.getLanguage() != null) {
            settings.setLanguage(request.getLanguage());
        }
        if (request.getNotificationsEnabled() != null) {
            settings.setNotificationsEnabled(request.getNotificationsEnabled());
        }
        if (request.getExtendedSettings() != null) {
            settings.setExtendedSettings(request.getExtendedSettings());
        }

        return toDto(settingsRepository.save(settings));
    }

    private UserSettingsDto toDto(UserSettings settings) {
        return UserSettingsDto.builder()
                .id(settings.getId())
                .userId(settings.getUser().getId())
                .theme(settings.getTheme())
                .language(settings.getLanguage())
                .notificationsEnabled(settings.getNotificationsEnabled())
                .extendedSettings(settings.getExtendedSettings())
                .build();
    }
}
