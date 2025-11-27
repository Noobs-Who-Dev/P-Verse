package com.app.pverse.dto.response.user;

import com.app.pverse.entity.UserSettings.Language;
import com.app.pverse.entity.UserSettings.Theme;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserSettingsDto {
    private Long id;
    private Long userId;
    private Theme theme;
    private Language language;
    private Boolean notificationsEnabled;
    private String extendedSettings;
}
