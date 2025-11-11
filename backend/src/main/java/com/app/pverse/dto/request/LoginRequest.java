package com.app.pverse.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoginRequest {
    @NotBlank(message = "Username/Email không được để trống")
    private String credential;

    @NotBlank(message = "Password không được để trống")
    private String password;
}
