package com.app.pverse.service;

import com.app.pverse.dto.request.UpdateSettingsRequest;
import com.app.pverse.dto.response.UserSettingsDto;
import com.app.pverse.entity.User;
import com.app.pverse.entity.UserSettings;
import com.app.pverse.exception.ResourceNotFoundException;
import com.app.pverse.repository.UserRepository;
import com.app.pverse.repository.UserSettingsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class UserSettingsService {
    private final UserSettingsRepository settingsRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public UserSettingsDto getSettings(Long userId) {
        // Tự động tạo settings nếu chưa có
        UserSettings settings = settingsRepository.findByUserId(userId)
                .orElseGet(() -> createDefaultSettings(userId));
        return toDto(settings);
    }

    private UserSettings createDefaultSettings(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User không tồn tại với ID: " + userId));

        UserSettings settings = UserSettings.builder()
                .user(user)
                .theme(UserSettings.Theme.DARK)
                .language(UserSettings.Language.VI)
                .notificationsEnabled(true)
                .build();

        return settingsRepository.save(settings);
    }

    public UserSettingsDto updateSettings(Long userId, UpdateSettingsRequest request) {
        UserSettings settings = settingsRepository.findByUserId(userId)
                .orElseGet(() -> createDefaultSettings(userId));

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

    public UserSettingsDto toggleNotifications(Long userId) {
        UserSettings settings = settingsRepository.findByUserId(userId)
                .orElseGet(() -> createDefaultSettings(userId));

        // Toggle notification status
        settings.setNotificationsEnabled(!settings.getNotificationsEnabled());

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
