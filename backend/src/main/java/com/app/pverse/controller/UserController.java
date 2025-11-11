package com.app.pverse.controller;

import com.app.pverse.dto.request.ChangePasswordRequest;
import com.app.pverse.dto.request.UpdateProfileRequest;
import com.app.pverse.dto.request.UpdateSettingsRequest;
import com.app.pverse.dto.request.UpdateUserRequest;
import com.app.pverse.dto.response.ApiResponse;
import com.app.pverse.dto.response.UserDto;
import com.app.pverse.dto.response.UserSettingsDto;
import com.app.pverse.entity.User;
import com.app.pverse.service.UserService;
import com.app.pverse.service.UserSettingsService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;
    private final UserSettingsService settingsService;

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserDto>> getCurrentUser(@AuthenticationPrincipal User user) {
        UserDto userDto = userService.getUserById(user.getId());
        return ResponseEntity.ok(ApiResponse.success(userDto));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<UserDto>> getUserById(@PathVariable Long id) {
        UserDto user = userService.getUserById(id);
        return ResponseEntity.ok(ApiResponse.success(user));
    }

    @GetMapping("/username/{username}")
    public ResponseEntity<UserDto> getUserByUsername(@PathVariable String username) {
        return ResponseEntity.ok(userService.getUserByUsername(username));
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserDto> updateUser(
            @PathVariable Long id,
            @RequestBody UpdateUserRequest request) {
        return ResponseEntity.ok(userService.updateUser(id, request));
    }

    @PatchMapping("/{id}/online-status")
    public ResponseEntity<Void> updateOnlineStatus(
            @PathVariable Long id,
            @RequestBody Map<String, Boolean> request) {
        userService.updateOnlineStatus(id, request.get("isOnline"));
        return ResponseEntity.ok().build();
    }

    @PutMapping("/profile")
    public ResponseEntity<ApiResponse<UserDto>> updateProfile(
            @AuthenticationPrincipal User user,
            @RequestBody @Valid UpdateProfileRequest request
    ) {
        UserDto updated = userService.updateProfile(user.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật profile thành công", updated));
    }

    @PutMapping("/password")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            @AuthenticationPrincipal User user,
            @RequestBody @Valid ChangePasswordRequest request
    ) {
        userService.changePassword(user.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Đổi password thành công", null));
    }

    @GetMapping("/settings")
    public ResponseEntity<ApiResponse<UserSettingsDto>> getSettings(@AuthenticationPrincipal User user) {
        UserSettingsDto settings = settingsService.getSettings(user.getId());
        return ResponseEntity.ok(ApiResponse.success(settings));
    }

    @PutMapping("/settings")
    public ResponseEntity<ApiResponse<UserSettingsDto>> updateSettings(
            @AuthenticationPrincipal User user,
            @RequestBody @Valid UpdateSettingsRequest request
    ) {
        UserSettingsDto updated = settingsService.updateSettings(user.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật settings thành công", updated));
    }
}
