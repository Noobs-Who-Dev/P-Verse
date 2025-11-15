package com.app.pverse.dto.request;

import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UpdateProfileRequest {
    @Size(max = 100, message = "Display name tối đa 100 ký tự")
    private String displayName;

    @Size(max = 500, message = "Bio tối đa 500 ký tự")
    private String bio;
}
