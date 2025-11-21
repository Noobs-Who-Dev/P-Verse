package com.app.pverse.controller;

import com.app.pverse.dto.request.ChangePasswordRequest;
import com.app.pverse.dto.request.UpdateProfileRequest;
import com.app.pverse.dto.request.UpdateSettingsRequest;
import com.app.pverse.dto.request.UpdateUserRequest;
import com.app.pverse.dto.response.ApiResponse;
import com.app.pverse.dto.response.UserDto;
import com.app.pverse.dto.response.UserProfileDto;
import com.app.pverse.dto.response.UserSettingsDto;
import com.app.pverse.entity.User;
import com.app.pverse.service.UserService;
import com.app.pverse.service.UserSettingsService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

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

    @GetMapping("/{id}/profile")
    public ResponseEntity<ApiResponse<UserProfileDto>> getUserProfile(
            @PathVariable Long id,
            @AuthenticationPrincipal User viewer) {
        UserProfileDto profile = userService.getUserProfile(id, viewer.getId());
        return ResponseEntity.ok(ApiResponse.success(profile));
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

    @PostMapping("/avatar")
    public ResponseEntity<ApiResponse<UserDto>> uploadAvatar(
            @AuthenticationPrincipal User user,
            @RequestParam("file") MultipartFile file
    ) {
        UserDto updated = userService.updateAvatar(user.getId(), file);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật avatar thành công", updated));
    }

    @DeleteMapping("/avatar")
    public ResponseEntity<ApiResponse<UserDto>> removeAvatar(@AuthenticationPrincipal User user) {
        UserDto updated = userService.removeAvatar(user.getId());
        return ResponseEntity.ok(ApiResponse.success("Xóa avatar thành công", updated));
    }
}
