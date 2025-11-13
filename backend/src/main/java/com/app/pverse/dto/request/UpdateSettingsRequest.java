package com.app.pverse.dto.request;

import com.app.pverse.entity.UserSettings.Language;
import com.app.pverse.entity.UserSettings.Theme;
import lombok.Data;

@Data
public class UpdateSettingsRequest {
    private Theme theme;

    private Language language;

    private Boolean notificationsEnabled;

    private String extendedSettings; // JSON string
}
