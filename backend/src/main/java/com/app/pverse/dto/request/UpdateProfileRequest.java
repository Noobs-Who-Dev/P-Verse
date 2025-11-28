package com.app.pverse.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UpdateProfileRequest {
    @Size(min = 3, max = 50, message = "Username phải có từ 3-50 ký tự")
    @Pattern(regexp = "^[a-zA-Z0-9._]+$", message = "Username chỉ được chứa chữ cái, số, dấu chấm và gạch dưới")
    private String username;

    @Size(max = 100, message = "Display name tối đa 100 ký tự")
    private String displayName;

    @Email(message = "Email không hợp lệ")
    private String email;

    @Size(max = 500, message = "Bio tối đa 500 ký tự")
    private String bio;
}
