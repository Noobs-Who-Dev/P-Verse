package com.app.pverse.dto.request;

import lombok.Data;

@Data
public class UpdateUserRequest {
    private String displayName;
    private String bio;
    private String phoneNumber;
    private String avatarUrl;
}
