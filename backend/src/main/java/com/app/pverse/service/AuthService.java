package com.app.pverse.service;

import com.app.pverse.dto.request.LoginRequest;
import com.app.pverse.dto.request.RegisterRequest;
import com.app.pverse.dto.response.AuthResponse;
import com.app.pverse.entity.User;
import com.app.pverse.entity.UserSettings;
import com.app.pverse.repository.UserRepository;
import com.app.pverse.repository.UserSettingsRepository;
import com.app.pverse.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final UserSettingsRepository userSettingsRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;

    /**
     * Login
     */
    public AuthResponse login(LoginRequest request) {
        // 1. Authenticate user
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getUsername(),
                        request.getPassword()
                )
        );

        // 2. Set authentication vào SecurityContext
        SecurityContextHolder.getContext().setAuthentication(authentication);

        // 3. Generate JWT token
        String jwt = tokenProvider.generateToken(authentication);

        // 4. Lấy user info
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // 5. Update last seen
        user.setLastSeenAt(LocalDateTime.now());
        userRepository.save(user);

        // 6. Return response
        return AuthResponse.builder()
                .accessToken(jwt)
                .tokenType("Bearer")
                .userId(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .displayName(user.getDisplayName())
                .avatarUrl(user.getAvatarUrl())
                .build();
    }

    /**
     * Register
     */
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        // 1. Kiểm tra username đã tồn tại chưa
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Username is already taken");
        }

        // 2. Kiểm tra email đã tồn tại chưa
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email is already in use");
        }

        // 3. Tạo user mới
        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setDisplayName(request.getDisplayName() != null ?
                request.getDisplayName() : request.getUsername());
        user.setCreatedAt(LocalDateTime.now());
        user.setLastSeenAt(LocalDateTime.now());

        User savedUser = userRepository.save(user);

        // 4. Tạo default settings cho user
        UserSettings settings = new UserSettings();
        settings.setUser(savedUser);
        settings.setTheme(UserSettings.Theme.LIGHT);
        settings.setLanguage(UserSettings.Language.VI);
        settings.setNotificationsEnabled(true);
        settings.setCreatedAt(LocalDateTime.now());
        settings.setUpdatedAt(LocalDateTime.now());

        userSettingsRepository.save(settings);

        // 5. Auto login sau khi register
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getUsername(),
                        request.getPassword()
                )
        );

        String jwt = tokenProvider.generateToken(authentication);

        // 6. Return response
        return AuthResponse.builder()
                .accessToken(jwt)
                .tokenType("Bearer")
                .userId(savedUser.getId())
                .username(savedUser.getUsername())
                .email(savedUser.getEmail())
                .displayName(savedUser.getDisplayName())
                .avatarUrl(savedUser.getAvatarUrl())
                .build();
    }
}