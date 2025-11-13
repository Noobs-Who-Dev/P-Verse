# ⚡ QUICK START: AUTHENTICATION IMPLEMENTATION

**Mục tiêu**: Triển khai Login/Logout trong 1-2 giờ  
**Yêu cầu**: Đã hoàn thành User Management Module

---

## 🎯 TÓM TẮT FLOW

```
User nhập login → Backend verify → Tạo JWT token → 
Frontend lưu token → Mỗi request gửi kèm token → 
Backend verify token → Cho phép truy cập
```

---

## 📦 BƯỚC 1: CÀI ĐẶT DEPENDENCIES (5 phút)

### Backend: Thêm vào `pom.xml`

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
```

Chạy:
```bash
cd D:\04.My_workspace\P-Verse\backend
.\mvnw.cmd clean install
```

---

## 🔧 BƯỚC 2: BACKEND - TẠO CÁC FILE (30 phút)

### Thứ tự tạo file:

1. **application.properties** - Thêm config
2. **JwtTokenProvider.java** - Tạo và verify token
3. **JwtAuthenticationFilter.java** - Filter kiểm tra token
4. **CustomUserDetailsService.java** - Load user từ DB
5. **SecurityConfig.java** - Cấu hình Spring Security
6. **DTOs** - LoginRequest, RegisterRequest, AuthResponse
7. **AuthService.java** - Business logic
8. **AuthController.java** - API endpoints

### Chi tiết từng file:

#### 1. application.properties

Thêm vào cuối file:
```properties
# JWT Configuration
jwt.secret=pverse-secret-key-for-jwt-token-generation-must-be-at-least-256-bits-long
jwt.expiration=86400000
```

#### 2. JwtTokenProvider.java

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

    public String generateToken(Authentication authentication) {
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtExpiration);
        SecretKey key = Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));

        return Jwts.builder()
                .subject(userDetails.getUsername())
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(key)
                .compact();
    }

    public String getUsernameFromToken(String token) {
        SecretKey key = Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
        Claims claims = Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
        return claims.getSubject();
    }

    public boolean validateToken(String token) {
        try {
            SecretKey key = Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
            Jwts.parser().verifyWith(key).build().parseSignedClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException ex) {
            log.error("Invalid JWT token: {}", ex.getMessage());
        }
        return false;
    }
}
```

#### 3. JwtAuthenticationFilter.java

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
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, 
            FilterChain filterChain) throws ServletException, IOException {
        try {
            String jwt = getJwtFromRequest(request);
            if (StringUtils.hasText(jwt) && tokenProvider.validateToken(jwt)) {
                String username = tokenProvider.getUsernameFromToken(jwt);
                UserDetails userDetails = userDetailsService.loadUserByUsername(username);
                UsernamePasswordAuthenticationToken authentication = 
                        new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authentication);
            }
        } catch (Exception ex) {
            log.error("Could not set user authentication", ex);
        }
        filterChain.doFilter(request, response);
    }

    private String getJwtFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
}
```

#### 4. CustomUserDetailsService.java

```java
package com.app.pverse.security;

import com.app.pverse.entity.User;
import com.app.pverse.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collections;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {
    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));

        return org.springframework.security.core.userdetails.User.builder()
                .username(user.getUsername())
                .password(user.getPassword())
                .authorities(Collections.singletonList(new SimpleGrantedAuthority("ROLE_USER")))
                .build();
    }
}
```

#### 5. SecurityConfig.java

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
@RequiredArgsConstructor
public class SecurityConfig {
    private final UserDetailsService userDetailsService;
    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable)
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**", "/error").permitAll()
                .anyRequest().authenticated()
            )
            .sessionManagement(session -> 
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}
```

#### 6. DTOs (3 files)

**LoginRequest.java**:
```java
package com.app.pverse.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LoginRequest {
    @NotBlank
    private String username;
    @NotBlank
    private String password;
}
```

**RegisterRequest.java**:
```java
package com.app.pverse.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class RegisterRequest {
    @NotBlank
    @Size(min = 3, max = 50)
    private String username;
    
    @NotBlank
    @Email
    private String email;
    
    @NotBlank
    @Size(min = 6)
    private String password;
    
    private String displayName;
}
```

**AuthResponse.java** (update existing):
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

#### 7. AuthService.java

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

    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );
        
        String jwt = tokenProvider.generateToken(authentication);
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        return AuthResponse.builder()
                .accessToken(jwt)
                .userId(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .displayName(user.getDisplayName())
                .avatarUrl(user.getAvatarUrl())
                .build();
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Username already exists");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setDisplayName(request.getDisplayName() != null ? request.getDisplayName() : request.getUsername());
        user.setCreatedAt(LocalDateTime.now());
        User savedUser = userRepository.save(user);

        UserSettings settings = new UserSettings();
        settings.setUser(savedUser);
        settings.setTheme(UserSettings.Theme.LIGHT);
        settings.setLanguage(UserSettings.Language.VI);
        settings.setNotificationsEnabled(true);
        settings.setCreatedAt(LocalDateTime.now());
        userSettingsRepository.save(settings);

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );
        String jwt = tokenProvider.generateToken(authentication);

        return AuthResponse.builder()
                .accessToken(jwt)
                .userId(savedUser.getId())
                .username(savedUser.getUsername())
                .email(savedUser.getEmail())
                .displayName(savedUser.getDisplayName())
                .build();
    }
}
```

#### 8. AuthController.java

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

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success("Login successful", response));
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity.ok(ApiResponse.success("Registration successful", response));
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout() {
        return ResponseEntity.ok(ApiResponse.success("Logout successful", null));
    }
}
```

#### 9. Update UserRepository

Thêm methods:
```java
boolean existsByUsername(String username);
boolean existsByEmail(String email);
```

---

## 🎨 BƯỚC 3: FRONTEND - TẠO CÁC FILE (30 phút)

### 1. AuthContext - `frontend/lib/auth/authContext.tsx`

Copy từ file AUTHENTICATION_IMPLEMENTATION_GUIDE.md (section Frontend BƯỚC 1)

### 2. Update Root Layout - `frontend/app/layout.tsx`

```typescript
import { AuthProvider } from '@/lib/auth/authContext';

export default function RootLayout({ children }: { children: React.ReactNode }) {
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

### 3. Login Page - `frontend/app/login/page.tsx`

Copy từ file AUTHENTICATION_IMPLEMENTATION_GUIDE.md (section Frontend BƯỚC 3)

### 4. Register Page - `frontend/app/register/page.tsx`

Copy từ file AUTHENTICATION_IMPLEMENTATION_GUIDE.md (section Frontend BƯỚC 4)

### 5. Update Axios - `frontend/lib/api/axios.ts`

```typescript
import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:8080/api',
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
```

---

## 🧪 BƯỚC 4: TESTING (10 phút)

### Test Backend

```bash
# 1. Register
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@test.com","password":"test123"}'

# 2. Login
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# 3. Access protected endpoint
curl http://localhost:8080/api/users/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Test Frontend

1. Start: `pnpm dev`
2. Truy cập: http://localhost:3000
3. Redirect → `/login`
4. Click "Sign up" → Register
5. Auto login → Redirect `/`
6. Logout → Về `/login`

---

## ✅ CHECKLIST

### Backend
- [ ] Thêm JWT dependencies
- [ ] Tạo 4 security files (JwtTokenProvider, Filter, UserDetailsService, SecurityConfig)
- [ ] Tạo 3 DTOs
- [ ] Tạo AuthService + AuthController
- [ ] Update UserRepository
- [ ] Test với curl

### Frontend
- [ ] Tạo AuthContext
- [ ] Update layout
- [ ] Tạo login page
- [ ] Tạo register page
- [ ] Update axios
- [ ] Test flow

---

## 🐛 TROUBLESHOOTING

### Lỗi: "Access Denied" khi call API

**Nguyên nhân**: Token không được gửi đúng

**Fix**: Kiểm tra:
1. Token có trong localStorage không?
2. Header có format `Bearer <token>` không?
3. Token còn hạn không?

### Lỗi: "Bad credentials"

**Nguyên nhân**: Sai username/password

**Fix**: 
1. Kiểm tra password trong DB đã hash chưa
2. Đảm bảo dùng BCryptPasswordEncoder

### Lỗi: CORS

**Fix**: Thêm vào SecurityConfig:
```java
.cors(cors -> cors.configurationSource(request -> {
    CorsConfiguration config = new CorsConfiguration();
    config.setAllowedOrigins(List.of("http://localhost:3000"));
    config.setAllowedMethods(List.of("*"));
    config.setAllowedHeaders(List.of("*"));
    config.setAllowCredentials(true);
    return config;
}))
```

---

## 📚 FILES CẦN TẠO

### Backend (10 files):
1. application.properties (edit)
2. JwtTokenProvider.java
3. JwtAuthenticationFilter.java
4. CustomUserDetailsService.java
5. SecurityConfig.java
6. LoginRequest.java
7. RegisterRequest.java
8. AuthResponse.java (edit)
9. AuthService.java
10. AuthController.java

### Frontend (5 files):
1. authContext.tsx
2. layout.tsx (edit)
3. login/page.tsx
4. register/page.tsx
5. axios.ts (edit)

---

**Tổng thời gian**: 1-2 giờ  
**Độ khó**: Medium  
**Kết quả**: Full authentication system với JWT

Chúc bạn triển khai thành công! 🚀

