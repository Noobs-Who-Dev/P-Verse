package com.app.pverse.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ChangePasswordRequest {
    @NotBlank(message = "Current password không được để trống")
    private String currentPassword;

    @NotBlank(message = "New password không được để trống")
    @Size(min = 8, max = 100, message = "New password phải từ 8-100 ký tự")
    @Pattern(
        regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).+$",
        message = "Password phải chứa ít nhất 1 chữ thường, 1 chữ hoa và 1 số"
    )
    private String newPassword;

    @NotBlank(message = "Confirm password không được để trống")
    private String confirmPassword;
}
