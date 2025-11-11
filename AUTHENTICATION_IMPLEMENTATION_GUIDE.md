# 🔐 HƯỚNG DẪN TRIỂN KHAI AUTHENTICATION (LOGIN/LOGOUT)

**Ngày tạo**: 10/11/2025  
**Module**: Authentication & Authorization  
**Độ khó**: ⭐⭐⭐ (Medium-Advanced)  
**Thời gian ước tính**: 2-3 giờ

---

## 📋 MỤC LỤC

1. [Tổng quan](#tổng-quan)
2. [Kiến thức cần có](#kiến-thức-cần-có)
3. [Cấu trúc tổng thể](#cấu-trúc-tổng-thể)
4. [Backend Implementation](#backend-implementation)
5. [Frontend Implementation](#frontend-implementation)
6. [Testing](#testing)
7. [Security Best Practices](#security-best-practices)

---

## 🎯 TỔNG QUAN

### Authentication là gì?

**Authentication** (Xác thực) là quá trình xác minh **"Bạn là ai?"**

- User nhập username/password
- Server kiểm tra thông tin
- Nếu đúng → Cấp token (JWT)
- Token dùng cho các request sau

### Authorization là gì?

**Authorization** (Phân quyền) là quá trình xác định **"Bạn được làm gì?"**

- User đã đăng nhập (authenticated)
- Kiểm tra quyền truy cập (roles, permissions)
- Cho phép hoặc từ chối hành động

### Flow tổng quát

```
1. User mở trang Login
2. Nhập username + password
3. Frontend gửi POST /api/auth/login
4. Backend kiểm tra username/password
5. Nếu đúng → Tạo JWT token
6. Frontend lưu token vào localStorage
7. Các request sau đính kèm token trong header
8. Backend verify token → Cho phép truy cập
9. User click Logout → Xóa token → Về trang Login
```

---

## 📚 KIẾN THỨC CẦN CÓ

### 1. JWT (JSON Web Token)

**JWT là gì?**
- Là một chuỗi ký tự mã hóa (token)
- Chứa thông tin user (username, roles, exp time...)
- Được ký bằng secret key
- Server có thể verify mà không cần tra database

**Cấu trúc JWT**:
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c

Gồm 3 phần (ngăn cách bởi dấu .):
1. Header (algorithm + type)
2. Payload (dữ liệu user)
3. Signature (chữ ký)
```

**Ưu điểm**:
- ✅ Stateless (server không cần lưu session)
- ✅ Scalable (dễ mở rộng)
- ✅ Cross-domain (dùng được cho mobile app)
- ✅ Self-contained (chứa đủ thông tin)

**Nhược điểm**:
- ⚠️ Không thể revoke (thu hồi) token trước khi hết hạn
- ⚠️ Token size lớn hơn session ID
- ⚠️ Cần bảo mật secret key

### 2. BCrypt

**BCrypt là gì?**
- Thuật toán hash password
- One-way hash (không thể decode ngược lại)
- Có salt (tránh rainbow table attack)
- Slow by design (tránh brute force)

**Ví dụ**:
```
Password gốc: admin123
BCrypt hash:  $2a$10$N9qo8uLOickgx2ZMRZoMye1g3UZKvAiB7TxQBBXxQr8Ys9K5Y9Z5m

Mỗi lần hash cùng 1 password → Kết quả khác nhau (vì salt random)
```

### 3. Spring Security

**Spring Security là gì?**
- Framework bảo mật cho Spring Boot
- Xử lý authentication, authorization
- Hỗ trợ JWT, OAuth2, LDAP...
- Filter-based architecture

**Flow của Spring Security**:
```
Request → SecurityFilterChain → Controller
           ↑
           1. UsernamePasswordAuthenticationFilter (Login)
           2. JwtAuthenticationFilter (Verify token)
           3. AuthorizationFilter (Check permissions)
```

---

## 🏗️ CẤU TRÚC TỔNG THỂ

### Backend Structure

```
backend/src/main/java/com/app/pverse/
├── config/
│   ├── SecurityConfig.java           ← Cấu hình Spring Security
│   └── JwtConfig.java                ← Cấu hình JWT (secret, expiration)
├── security/
│   ├── JwtTokenProvider.java         ← Tạo và verify JWT token
│   ├── JwtAuthenticationFilter.java  ← Filter kiểm tra token
│   └── CustomUserDetailsService.java ← Load user từ database
├── controller/
│   └── AuthController.java           ← API login, logout, register
├── dto/
│   ├── request/
│   │   ├── LoginRequest.java         ← DTO cho login
│   │   └── RegisterRequest.java      ← DTO cho register
│   └── response/
│       └── AuthResponse.java         ← DTO trả về (token + user info)
└── service/
    └── AuthService.java              ← Business logic cho auth
```

### Frontend Structure

```
frontend/
├── app/
│   ├── (auth)/                       ← Layout cho auth pages
│   │   ├── login/
│   │   │   └── page.tsx              ← Login page
│   │   ├── register/
│   │   │   └── page.tsx              ← Register page
│   │   └── layout.tsx                ← Auth layout
│   └── (protected)/                  ← Layout cho protected pages
│       ├── dashboard/
│       ├── profile/
│       └── layout.tsx                ← Protected layout (check auth)
├── lib/
│   ├── auth/
│   │   ├── authContext.tsx           ← React Context cho auth state
│   │   ├── authService.ts            ← API calls (login, logout)
│   │   └── tokenStorage.ts           ← Lưu/lấy token từ localStorage
│   └── api/
│       └── axios.ts                  ← Axios instance (tự động thêm token)
└── middleware.ts                     ← Next.js middleware (protect routes)
```

---

## 🔧 BACKEND IMPLEMENTATION

### BƯỚC 1: Thêm Dependencies

Mở file `backend/pom.xml`, thêm dependencies:

```xml
<!-- JWT -->
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-api</artifactId>
    <version>0.12.3</version>
</dependency>
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-impl</artifactId>
    <version>0.12.3</version>
    <scope>runtime</scope>
</dependency>
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-jackson</artifactId>
    <version>0.12.3</version>
    <scope>runtime</scope>
</dependency>

<!-- Spring Security (should already exist) -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-security</artifactId>
</dependency>
```

### BƯỚC 2: Cấu hình JWT Properties

Mở file `backend/src/main/resources/application.properties`, thêm:

```properties
# JWT Configuration
jwt.secret=your-very-long-secret-key-at-least-256-bits-long-for-HS256-algorithm
jwt.expiration=86400000
# 86400000 ms = 24 hours
```

⚠️ **LƯU Ý**: Trong production, đừng hardcode secret key! Dùng environment variable.

### BƯỚC 3: Tạo JWT Token Provider

Tạo file `backend/src/main/java/com/app/pverse/security/JwtTokenProvider.java`:

```java
package com.app.pverse.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Slf4j
@Component
public class JwtTokenProvider {

    @Value("${jwt.secret}")
    private String jwtSecret;

    @Value("${jwt.expiration}")
    private long jwtExpiration;

    /**
     * Tạo JWT token từ thông tin user
     */
    public String generateToken(Authentication authentication) {
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtExpiration);

        SecretKey key = Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));

        return Jwts.builder()
                .subject(userDetails.getUsername())  // Username
                .issuedAt(now)                       // Thời gian tạo
                .expiration(expiryDate)              // Thời gian hết hạn
                .signWith(key)                       // Ký bằng secret key
                .compact();
    }

    /**
     * Lấy username từ JWT token
     */
    public String getUsernameFromToken(String token) {
        SecretKey key = Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
        
        Claims claims = Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();

        return claims.getSubject();
    }

    /**
     * Validate JWT token
     */
    public boolean validateToken(String token) {
        try {
            SecretKey key = Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
            
            Jwts.parser()
                    .verifyWith(key)
                    .build()
                    .parseSignedClaims(token);
            
            return true;
        } catch (SecurityException ex) {
            log.error("Invalid JWT signature");
        } catch (MalformedJwtException ex) {
            log.error("Invalid JWT token");
        } catch (ExpiredJwtException ex) {
            log.error("Expired JWT token");
        } catch (UnsupportedJwtException ex) {
            log.error("Unsupported JWT token");
        } catch (IllegalArgumentException ex) {
            log.error("JWT claims string is empty");
        }
        return false;
    }
}
```

**Giải thích**:
- `generateToken()`: Tạo JWT token từ user đã authenticate
- `getUsernameFromToken()`: Parse token để lấy username
- `validateToken()`: Kiểm tra token có hợp lệ không (signature, expiration...)

### BƯỚC 4: Tạo JWT Authentication Filter

Tạo file `backend/src/main/java/com/app/pverse/security/JwtAuthenticationFilter.java`:

```java
package com.app.pverse.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Slf4j
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtTokenProvider tokenProvider;
    private final UserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {
        
        try {
            // 1. Lấy JWT token từ request header
            String jwt = getJwtFromRequest(request);

            // 2. Validate token
            if (StringUtils.hasText(jwt) && tokenProvider.validateToken(jwt)) {
                // 3. Lấy username từ token
                String username = tokenProvider.getUsernameFromToken(jwt);

                // 4. Load user details từ database
                UserDetails userDetails = userDetailsService.loadUserByUsername(username);

                // 5. Tạo Authentication object
                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(
                                userDetails,
                                null,
                                userDetails.getAuthorities()
                        );
                
                authentication.setDetails(
                        new WebAuthenticationDetailsSource().buildDetails(request)
                );

                // 6. Set authentication vào SecurityContext
                SecurityContextHolder.getContext().setAuthentication(authentication);
            }
        } catch (Exception ex) {
            log.error("Could not set user authentication in security context", ex);
        }

        // 7. Tiếp tục filter chain
        filterChain.doFilter(request, response);
    }

    /**
     * Lấy JWT token từ Authorization header
     * Header format: "Bearer <token>"
     */
    private String getJwtFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7); // Bỏ "Bearer " để lấy token
        }
        
        return null;
    }
}
```

**Giải thích flow**:
1. Mỗi request đến → Filter này chạy trước controller
2. Lấy token từ header `Authorization: Bearer <token>`
3. Validate token (signature, expiration)
4. Nếu hợp lệ → Load user từ database
5. Set user vào SecurityContext
6. Controller có thể dùng `@AuthenticationPrincipal` để lấy user

### BƯỚC 5: Tạo Custom UserDetailsService

Tạo file `backend/src/main/java/com/app/pverse/security/CustomUserDetailsService.java`:

```java
package com.app.pverse.security;

import com.app.pverse.entity.User;
import com.app.pverse.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collection;
import java.util.Collections;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    @Transactional
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() ->
                        new UsernameNotFoundException("User not found with username: " + username)
                );

        return org.springframework.security.core.userdetails.User.builder()
                .username(user.getUsername())
                .password(user.getPassword())
                .authorities(getAuthorities())
                .accountExpired(false)
                .accountLocked(false)
                .credentialsExpired(false)
                .disabled(false)
                .build();
    }

    /**
     * Lấy quyền của user
     * TODO: Implement roles/permissions từ database
     */
    private Collection<? extends GrantedAuthority> getAuthorities() {
        // Hiện tại: Tất cả user đều có role USER
        // Tương lai: Load từ user.roles trong database
        return Collections.singletonList(new SimpleGrantedAuthority("ROLE_USER"));
    }
}
```

**Giải thích**:
- Spring Security cần `UserDetailsService` để load user
- `loadUserByUsername()`: Tìm user trong database theo username
- Trả về Spring Security's UserDetails (khác với entity User)
- Hiện tại hardcode role "ROLE_USER", sau này sẽ load từ DB

### BƯỚC 6: Tạo Security Configuration

Tạo file `backend/src/main/java/com/app/pverse/config/SecurityConfig.java`:

```java
package com.app.pverse.config;

import com.app.pverse.security.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final UserDetailsService userDetailsService;
    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    /**
     * Cấu hình Security Filter Chain
     */
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // Disable CSRF (vì dùng JWT, không dùng session)
                .csrf(AbstractHttpConfigurer::disable)
                
                // Cấu hình authorization
                .authorizeHttpRequests(auth -> auth
                        // Public endpoints (không cần authentication)
                        .requestMatchers(
                                "/api/auth/**",           // Login, register, etc.
                                "/error",
                                "/actuator/health"
                        ).permitAll()
                        
                        // Tất cả request khác cần authentication
                        .anyRequest().authenticated()
                )
                
                // Stateless session (không dùng session, dùng JWT)
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )
                
                // Thêm JWT filter trước UsernamePasswordAuthenticationFilter
                .addFilterBefore(
                        jwtAuthenticationFilter,
                        UsernamePasswordAuthenticationFilter.class
                );

        return http.build();
    }

    /**
     * Password Encoder (BCrypt)
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    /**
     * Authentication Provider
     */
    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    /**
     * Authentication Manager
     */
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config)
            throws Exception {
        return config.getAuthenticationManager();
    }
}
```

**Giải thích**:
- `securityFilterChain()`: Cấu hình các rule bảo mật
  - `/api/auth/**`: Public (login, register)
  - Tất cả API khác: Cần authentication
  - Stateless (không dùng session)
- `passwordEncoder()`: BCrypt để hash password
- `authenticationProvider()`: Kết nối UserDetailsService và PasswordEncoder
- `authenticationManager()`: Xử lý authentication

### BƯỚC 7: Tạo DTOs

#### LoginRequest.java

Tạo file `backend/src/main/java/com/app/pverse/dto/request/LoginRequest.java`:

```java
package com.app.pverse.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LoginRequest {
    @NotBlank(message = "Username is required")
    private String username;

    @NotBlank(message = "Password is required")
    private String password;
}
```

#### RegisterRequest.java

Tạo file `backend/src/main/java/com/app/pverse/dto/request/RegisterRequest.java`:

```java
package com.app.pverse.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class RegisterRequest {
    @NotBlank(message = "Username is required")
    @Size(min = 3, max = 50, message = "Username must be between 3 and 50 characters")
    private String username;

    @NotBlank(message = "Email is required")
    @Email(message = "Email should be valid")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 6, message = "Password must be at least 6 characters")
    private String password;

    private String displayName;
}
```

#### AuthResponse.java

Sửa file `backend/src/main/java/com/app/pverse/dto/response/AuthResponse.java` (nếu đã có) hoặc tạo mới:

```java
package com.app.pverse.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {
    private String accessToken;
    private String tokenType = "Bearer";
    private Long userId;
    private String username;
    private String email;
    private String displayName;
    private String avatarUrl;
}
```

### BƯỚC 8: Tạo Auth Service

Tạo file `backend/src/main/java/com/app/pverse/service/AuthService.java`:

```java
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
```

**Giải thích**:
- `login()`: 
  1. Authenticate với username/password
  2. Tạo JWT token
  3. Trả về token + user info
- `register()`:
  1. Validate username/email chưa tồn tại
  2. Hash password bằng BCrypt
  3. Tạo user mới
  4. Tạo default settings
  5. Auto login

### BƯỚC 9: Tạo Auth Controller

Tạo file `backend/src/main/java/com/app/pverse/controller/AuthController.java`:

```java
package com.app.pverse.controller;

import com.app.pverse.dto.request.LoginRequest;
import com.app.pverse.dto.request.RegisterRequest;
import com.app.pverse.dto.response.ApiResponse;
import com.app.pverse.dto.response.AuthResponse;
import com.app.pverse.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    /**
     * Login
     * POST /api/auth/login
     */
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(
            @Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success("Login successful", response));
    }

    /**
     * Register
     * POST /api/auth/register
     */
    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(
            @Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity.ok(ApiResponse.success("Registration successful", response));
    }

    /**
     * Logout (Client-side only, just remove token)
     * POST /api/auth/logout
     */
    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout() {
        // JWT stateless, server không cần làm gì
        // Client chỉ cần xóa token từ localStorage
        return ResponseEntity.ok(ApiResponse.success("Logout successful", null));
    }
}
```

### BƯỚC 10: Update UserRepository

Thêm methods vào `UserRepository.java`:

```java
package com.app.pverse.repository;

import com.app.pverse.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    Optional<User> findByEmail(String email);
    boolean existsByUsername(String username);
    boolean existsByEmail(String email);
}
```

### BƯỚC 11: Update CORS Configuration

Sửa file `CorsConfig.java` để cho phép `/api/auth/**`:

```java
@Configuration
public class CorsConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins("http://localhost:3000")
                .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .exposedHeaders("Authorization")
                .allowCredentials(true);
    }
}
```

---

## 🎨 FRONTEND IMPLEMENTATION

### BƯỚC 1: Tạo Auth Context

Tạo file `frontend/lib/auth/authContext.tsx`:

```typescript
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: number;
  username: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string, displayName?: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Load user từ localStorage khi app start
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string) => {
    const response = await fetch('http://localhost:8080/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Login failed');
    }

    const data = await response.json();
    const { accessToken, userId, username: userName, email, displayName, avatarUrl } = data.data;

    // Lưu vào state
    setToken(accessToken);
    setUser({ id: userId, username: userName, email, displayName, avatarUrl });

    // Lưu vào localStorage
    localStorage.setItem('token', accessToken);
    localStorage.setItem('user', JSON.stringify({ id: userId, username: userName, email, displayName, avatarUrl }));

    // Redirect
    router.push('/');
  };

  const register = async (username: string, email: string, password: string, displayName?: string) => {
    const response = await fetch('http://localhost:8080/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password, displayName }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Registration failed');
    }

    const data = await response.json();
    const { accessToken, userId, username: userName, email: userEmail, displayName: userDisplayName, avatarUrl } = data.data;

    // Auto login
    setToken(accessToken);
    setUser({ id: userId, username: userName, email: userEmail, displayName: userDisplayName, avatarUrl });

    localStorage.setItem('token', accessToken);
    localStorage.setItem('user', JSON.stringify({ id: userId, username: userName, email: userEmail, displayName: userDisplayName, avatarUrl }));

    router.push('/');
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        register,
        logout,
        isAuthenticated: !!token,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
```

### BƯỚC 2: Update Root Layout

Sửa file `frontend/app/layout.tsx`:

```typescript
import { AuthProvider } from '@/lib/auth/authContext';
import './globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
```

### BƯỚC 3: Tạo Login Page

Tạo file `frontend/app/login/page.tsx`:

```typescript
'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth/authContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(username, password);
      // Redirect được handle trong login function
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <div>
          <h2 className="text-center text-3xl font-bold">Sign in to P-Verse</h2>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 text-red-500 p-3 rounded">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="username" className="block text-sm font-medium">
              Username
            </label>
            <input
              id="username"
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? 'Signing in...' : 'Sign in'}
          </button>

          <p className="text-center text-sm">
            Don't have an account?{' '}
            <Link href="/register" className="text-blue-600 hover:underline">
              Sign up
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
```

### BƯỚC 4: Tạo Register Page

Tạo file `frontend/app/register/page.tsx`:

```typescript
'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth/authContext';
import Link from 'next/link';

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await register(username, email, password, displayName);
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <div>
          <h2 className="text-center text-3xl font-bold">Create your account</h2>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 text-red-500 p-3 rounded">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="username" className="block text-sm font-medium">
              Username
            </label>
            <input
              id="username"
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>

          <div>
            <label htmlFor="displayName" className="block text-sm font-medium">
              Display Name (Optional)
            </label>
            <input
              id="displayName"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? 'Creating account...' : 'Sign up'}
          </button>

          <p className="text-center text-sm">
            Already have an account?{' '}
            <Link href="/login" className="text-blue-600 hover:underline">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
```

### BƯỚC 5: Update Axios Instance

Sửa file `frontend/lib/api/axios.ts` để tự động thêm token:

```typescript
import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: Tự động thêm token vào header
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor: Xử lý lỗi 401 (Unauthorized)
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token hết hạn hoặc invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
```

### BƯỚC 6: Tạo Protected Route Middleware

Tạo file `frontend/middleware.ts`:

```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  // Public routes
  const publicRoutes = ['/login', '/register'];
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));

  // Nếu chưa login và truy cập protected route
  if (!token && !isPublicRoute) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Nếu đã login và truy cập login/register
  if (token && isPublicRoute) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
```

**Lưu ý**: Middleware này check cookie, nhưng chúng ta dùng localStorage. Có thể bỏ qua middleware và check ở client-side.

### BƯỚC 7: Update Header Component

Sửa file `frontend/components/header.tsx` để thêm logout button:

```typescript
'use client';

import { useAuth } from '@/lib/auth/authContext';

export default function Header() {
  const { user, logout, isAuthenticated } = useAuth();

  if (!isAuthenticated) return null;

  return (
    <header className="border-b">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <h1 className="text-xl font-bold">P-Verse</h1>
        
        <div className="flex items-center gap-4">
          <span>Welcome, {user?.displayName}</span>
          <button
            onClick={logout}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
```

---

## 🧪 TESTING

### Test Backend

#### 1. Test Register API

```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123",
    "displayName": "Test User"
  }'
```

**Expected Response**:
```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "tokenType": "Bearer",
    "userId": 6,
    "username": "testuser",
    "email": "test@example.com",
    "displayName": "Test User",
    "avatarUrl": null
  }
}
```

#### 2. Test Login API

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123"
  }'
```

#### 3. Test Protected Endpoint

```bash
curl -X GET http://localhost:8080/api/users/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Test Frontend

1. **Start frontend**: `pnpm dev`
2. **Truy cập** http://localhost:3000
3. **Tự động redirect** → `/login`
4. **Register account**
5. **Login**
6. **Kiểm tra** localStorage có token không
7. **Click logout** → Về trang login

---

## 🔒 SECURITY BEST PRACTICES

### 1. JWT Secret Key

❌ **KHÔNG BAO GIỜ**:
```properties
jwt.secret=mysecret
```

✅ **NÊN**:
```properties
jwt.secret=${JWT_SECRET:your-default-secret-for-dev}
```

Dùng environment variable trong production:
```bash
export JWT_SECRET="very-long-random-secret-key-256-bits-at-least"
```

### 2. Token Expiration

- **Access Token**: 15 phút - 1 ngày
- **Refresh Token**: 7-30 ngày (implement sau)

### 3. Password Requirements

- Minimum 8 characters
- Mix of uppercase, lowercase, numbers, special chars
- Use validator library

### 4. HTTPS Only

Production PHẢI dùng HTTPS để tránh token bị intercept.

### 5. XSS Protection

- Sanitize user input
- Use `httpOnly` cookies (nếu dùng cookies thay vì localStorage)

### 6. CSRF Protection

- Nếu dùng cookies → Enable CSRF protection
- Nếu dùng JWT trong header → Không cần CSRF

---

## 📝 CHECKLIST TRIỂN KHAI

### Backend

- [ ] Thêm JWT dependencies vào pom.xml
- [ ] Tạo JwtTokenProvider
- [ ] Tạo JwtAuthenticationFilter
- [ ] Tạo CustomUserDetailsService
- [ ] Cấu hình SecurityConfig
- [ ] Tạo AuthController, AuthService
- [ ] Tạo DTOs (LoginRequest, RegisterRequest, AuthResponse)
- [ ] Update UserRepository (existsByUsername, existsByEmail)
- [ ] Test API với Postman/curl

### Frontend

- [ ] Tạo AuthContext
- [ ] Update Root Layout với AuthProvider
- [ ] Tạo Login Page
- [ ] Tạo Register Page
- [ ] Update Axios instance (auto add token)
- [ ] Update Header (logout button)
- [ ] Test flow: Register → Login → Access page → Logout

---

## 🚀 BƯỚC TIẾP THEO

Sau khi hoàn thành Authentication, bạn có thể:

1. **Implement Refresh Token** (auto renew token)
2. **Add Role-Based Access Control** (ADMIN, USER, MODERATOR)
3. **Forgot Password / Reset Password**
4. **Email Verification**
5. **OAuth2 Login** (Google, Facebook)
6. **Two-Factor Authentication (2FA)**

---

## 📚 TÀI LIỆU THAM KHẢO

- [Spring Security Documentation](https://spring.io/projects/spring-security)
- [JWT.io](https://jwt.io/)
- [JJWT GitHub](https://github.com/jwtk/jjwt)
- [Next.js Authentication](https://nextjs.org/docs/authentication)

---

**Chúc bạn triển khai thành công! 🎉**

_Nếu gặp vấn đề, hãy kiểm tra logs và verify từng bước một._

