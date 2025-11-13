# 🔄 Refresh Token Implementation - Quick Start Guide

**Ưu tiên:** ⭐⭐⭐ CAO NHẤT  
**Thời gian ước tính:** 2-3 ngày  
**Độ khó:** Trung bình

---

## 📋 Tại sao cần Refresh Token?

### Vấn đề hiện tại:
```
User login → Nhận JWT token (expires in 1 giờ)
→ Sau 1 giờ → Token hết hạn → 401 Unauthorized
→ User bị logout ngay lập tức
→ Phải login lại (VERY BAD UX!)
```

### Với Refresh Token:
```
User login → Nhận Access Token (1h) + Refresh Token (7 ngày)
→ Sau 1 giờ → Access token hết hạn
→ Frontend tự động gọi /refresh với refresh token
→ Nhận access token mới
→ User không bị gián đoạn! ✅
```

---

## 🏗️ Architecture

```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│   Browser   │         │   Backend   │         │  Database   │
└─────────────┘         └─────────────┘         └─────────────┘
       │                       │                       │
       │  1. POST /login       │                       │
       ├──────────────────────>│                       │
       │                       │  2. Validate user     │
       │                       ├──────────────────────>│
       │                       │                       │
       │                       │  3. Generate tokens   │
       │                       │    - Access (1h)      │
       │                       │    - Refresh (7d)     │
       │                       │                       │
       │                       │  4. Save refresh      │
       │                       │     token to DB       │
       │                       ├──────────────────────>│
       │                       │                       │
       │  5. Response with     │                       │
       │     both tokens       │                       │
       │<──────────────────────┤                       │
       │                       │                       │
       │  6. Store tokens      │                       │
       │     localStorage      │                       │
       │                       │                       │
       │  ... 1 hour later ... │                       │
       │                       │                       │
       │  7. GET /api/users    │                       │
       │     (Access expired)  │                       │
       ├──────────────────────>│                       │
       │                       │                       │
       │  8. 401 Unauthorized  │                       │
       │<──────────────────────┤                       │
       │                       │                       │
       │  9. POST /refresh     │                       │
       │     with refresh      │                       │
       ├──────────────────────>│                       │
       │                       │  10. Validate refresh │
       │                       │      token from DB    │
       │                       ├──────────────────────>│
       │                       │                       │
       │                       │  11. Generate new     │
       │                       │      access token     │
       │                       │                       │
       │  12. New access token │                       │
       │<──────────────────────┤                       │
       │                       │                       │
       │  13. Retry original   │                       │
       │      request          │                       │
       ├──────────────────────>│                       │
       │                       │                       │
       │  14. Success!         │                       │
       │<──────────────────────┤                       │
```

---

## 🚀 Implementation Steps

### PART 1: Backend (Spring Boot)

#### Step 1: Create RefreshToken Entity

**File:** `backend/src/main/java/com/app/pverse/entity/RefreshToken.java`

```java
package com.app.pverse.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "refresh_tokens")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RefreshToken {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, unique = true, length = 500)
    private String token;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @Column(nullable = false)
    private Instant expiryDate;
    
    @Column(length = 500)
    private String deviceInfo; // Optional: Browser, OS, Device
    
    @Column(length = 100)
    private String ipAddress; // Optional: Track IP
    
    @Column(nullable = false)
    private boolean revoked = false;
    
    @Column(nullable = false, updatable = false)
    private Instant createdAt = Instant.now();
    
    // Helper method
    public boolean isExpired() {
        return Instant.now().isAfter(expiryDate);
    }
}
```

---

#### Step 2: Create RefreshToken Repository

**File:** `backend/src/main/java/com/app/pverse/repository/RefreshTokenRepository.java`

```java
package com.app.pverse.repository;

import com.app.pverse.entity.RefreshToken;
import com.app.pverse.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Repository
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {
    
    Optional<RefreshToken> findByToken(String token);
    
    List<RefreshToken> findByUser(User user);
    
    @Modifying
    @Query("DELETE FROM RefreshToken rt WHERE rt.user = :user")
    void deleteByUser(User user);
    
    @Modifying
    @Query("DELETE FROM RefreshToken rt WHERE rt.expiryDate < :now")
    void deleteExpiredTokens(Instant now);
    
    @Modifying
    @Query("UPDATE RefreshToken rt SET rt.revoked = true WHERE rt.user = :user")
    void revokeAllUserTokens(User user);
}
```

---

#### Step 3: Create DTOs

**File:** `backend/src/main/java/com/app/pverse/dto/request/RefreshTokenRequest.java`

```java
package com.app.pverse.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class RefreshTokenRequest {
    
    @NotBlank(message = "Refresh token is required")
    private String refreshToken;
}
```

**Update:** `backend/src/main/java/com/app/pverse/dto/response/AuthResponse.java`

```java
package com.app.pverse.dto.response;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {
    
    private String accessToken;
    
    private String refreshToken; // NEW FIELD
    
    private String tokenType;
    
    private Long expiresIn; // Access token expiration in seconds
    
    private UserDto user;
}
```

---

#### Step 4: Create RefreshTokenService

**File:** `backend/src/main/java/com/app/pverse/service/RefreshTokenService.java`

```java
package com.app.pverse.service;

import com.app.pverse.entity.RefreshToken;
import com.app.pverse.entity.User;
import com.app.pverse.repository.RefreshTokenRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class RefreshTokenService {
    
    private final RefreshTokenRepository refreshTokenRepository;
    
    @Value("${jwt.refresh-expiration:604800000}") // 7 days default
    private Long refreshTokenExpiration;
    
    /**
     * Tạo refresh token mới cho user
     */
    @Transactional
    public RefreshToken createRefreshToken(User user, String deviceInfo, String ipAddress) {
        // Revoke all existing tokens của user (optional - nếu muốn 1 user chỉ login 1 device)
        // refreshTokenRepository.revokeAllUserTokens(user);
        
        RefreshToken refreshToken = RefreshToken.builder()
                .user(user)
                .token(UUID.randomUUID().toString())
                .expiryDate(Instant.now().plus(refreshTokenExpiration, ChronoUnit.MILLIS))
                .deviceInfo(deviceInfo)
                .ipAddress(ipAddress)
                .build();
        
        return refreshTokenRepository.save(refreshToken);
    }
    
    /**
     * Tìm và validate refresh token
     */
    public Optional<RefreshToken> findByToken(String token) {
        return refreshTokenRepository.findByToken(token);
    }
    
    /**
     * Verify refresh token (check expiration & revoked status)
     */
    public RefreshToken verifyExpiration(RefreshToken token) {
        if (token.isExpired()) {
            refreshTokenRepository.delete(token);
            throw new RuntimeException("Refresh token was expired. Please make a new login request");
        }
        
        if (token.isRevoked()) {
            throw new RuntimeException("Refresh token was revoked. Please make a new login request");
        }
        
        return token;
    }
    
    /**
     * Revoke refresh token (logout)
     */
    @Transactional
    public void revokeToken(String token) {
        refreshTokenRepository.findByToken(token)
                .ifPresent(rt -> {
                    rt.setRevoked(true);
                    refreshTokenRepository.save(rt);
                });
    }
    
    /**
     * Revoke all user's tokens (logout all devices)
     */
    @Transactional
    public void revokeAllUserTokens(User user) {
        refreshTokenRepository.revokeAllUserTokens(user);
    }
    
    /**
     * Cleanup expired tokens (chạy mỗi ngày)
     */
    @Scheduled(cron = "0 0 2 * * ?") // 2 AM every day
    @Transactional
    public void cleanupExpiredTokens() {
        int deleted = refreshTokenRepository.findAll().stream()
                .filter(RefreshToken::isExpired)
                .peek(refreshTokenRepository::delete)
                .toList()
                .size();
        
        log.info("Cleaned up {} expired refresh tokens", deleted);
    }
}
```

---

#### Step 5: Update AuthService

**Update:** `backend/src/main/java/com/app/pverse/service/AuthService.java`

```java
package com.app.pverse.service;

import com.app.pverse.dto.request.LoginRequest;
import com.app.pverse.dto.request.RegisterRequest;
import com.app.pverse.dto.request.RefreshTokenRequest;
import com.app.pverse.dto.response.AuthResponse;
import com.app.pverse.dto.response.UserDto;
import com.app.pverse.entity.RefreshToken;
import com.app.pverse.entity.User;
import com.app.pverse.repository.UserRepository;
import com.app.pverse.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    private final RefreshTokenService refreshTokenService; // NEW

    @Transactional
    public AuthResponse login(LoginRequest request, String deviceInfo, String ipAddress) {
        // Authenticate
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );

        // Generate access token
        String accessToken = tokenProvider.generateToken(authentication);

        // Generate refresh token
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        RefreshToken refreshToken = refreshTokenService.createRefreshToken(user, deviceInfo, ipAddress);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken.getToken())
                .tokenType("Bearer")
                .expiresIn(3600L) // 1 hour in seconds
                .user(UserDto.fromEntity(user))
                .build();
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        // Validate
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Username already exists");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        // Create user
        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .build();

        userRepository.save(user);

        // Auto login after register
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );

        String accessToken = tokenProvider.generateToken(authentication);
        RefreshToken refreshToken = refreshTokenService.createRefreshToken(user, "Registration", "");

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken.getToken())
                .tokenType("Bearer")
                .expiresIn(3600L)
                .user(UserDto.fromEntity(user))
                .build();
    }
    
    /**
     * NEW: Refresh access token using refresh token
     */
    @Transactional
    public AuthResponse refreshAccessToken(RefreshTokenRequest request) {
        String requestRefreshToken = request.getRefreshToken();
        
        return refreshTokenService.findByToken(requestRefreshToken)
                .map(refreshTokenService::verifyExpiration)
                .map(RefreshToken::getUser)
                .map(user -> {
                    // Create new authentication for token generation
                    UsernamePasswordAuthenticationToken authentication = 
                        new UsernamePasswordAuthenticationToken(user, null, user.getAuthorities());
                    
                    String newAccessToken = tokenProvider.generateToken(authentication);
                    
                    return AuthResponse.builder()
                            .accessToken(newAccessToken)
                            .refreshToken(requestRefreshToken) // Keep same refresh token
                            .tokenType("Bearer")
                            .expiresIn(3600L)
                            .user(UserDto.fromEntity(user))
                            .build();
                })
                .orElseThrow(() -> new RuntimeException("Refresh token not found"));
    }
    
    /**
     * NEW: Logout with refresh token revocation
     */
    @Transactional
    public void logout(String refreshToken) {
        if (refreshToken != null && !refreshToken.isEmpty()) {
            refreshTokenService.revokeToken(refreshToken);
        }
    }
}
```

---

#### Step 6: Update AuthController

**Update:** `backend/src/main/java/com/app/pverse/controller/AuthController.java`

```java
package com.app.pverse.controller;

import com.app.pverse.dto.request.LoginRequest;
import com.app.pverse.dto.request.RefreshTokenRequest;
import com.app.pverse.dto.request.RegisterRequest;
import com.app.pverse.dto.response.ApiResponse;
import com.app.pverse.dto.response.AuthResponse;
import com.app.pverse.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
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
    public ResponseEntity<ApiResponse<AuthResponse>> login(
            @Valid @RequestBody LoginRequest request,
            HttpServletRequest httpRequest) {
        
        String deviceInfo = getDeviceInfo(httpRequest);
        String ipAddress = getClientIP(httpRequest);
        
        AuthResponse response = authService.login(request, deviceInfo, ipAddress);
        return ResponseEntity.ok(ApiResponse.success("Login successful", response));
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(
            @Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity.ok(ApiResponse.success("Registration successful", response));
    }
    
    /**
     * NEW: Refresh access token
     */
    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<AuthResponse>> refreshToken(
            @Valid @RequestBody RefreshTokenRequest request) {
        AuthResponse response = authService.refreshAccessToken(request);
        return ResponseEntity.ok(ApiResponse.success("Token refreshed successfully", response));
    }

    /**
     * UPDATED: Logout with refresh token revocation
     */
    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(
            @RequestBody(required = false) RefreshTokenRequest request) {
        if (request != null && request.getRefreshToken() != null) {
            authService.logout(request.getRefreshToken());
        }
        return ResponseEntity.ok(ApiResponse.success("Logout successful", null));
    }
    
    // Helper methods
    private String getDeviceInfo(HttpServletRequest request) {
        String userAgent = request.getHeader("User-Agent");
        return userAgent != null ? userAgent.substring(0, Math.min(userAgent.length(), 500)) : "Unknown";
    }
    
    private String getClientIP(HttpServletRequest request) {
        String xfHeader = request.getHeader("X-Forwarded-For");
        if (xfHeader == null) {
            return request.getRemoteAddr();
        }
        return xfHeader.split(",")[0];
    }
}
```

---

#### Step 7: Enable Scheduling

**Update:** `backend/src/main/java/com/app/pverse/PverseApplication.java`

```java
@SpringBootApplication
@EnableScheduling // ADD THIS
public class PverseApplication {
    public static void main(String[] args) {
        SpringApplication.run(PverseApplication.class, args);
    }
}
```

---

#### Step 8: Update application.properties

**Add:**

```properties
# JWT Configuration
jwt.secret=your-super-secret-key-change-this-in-production-minimum-256-bits
jwt.expiration=3600000
# Refresh token expiration (7 days in milliseconds)
jwt.refresh-expiration=604800000
```

---

### PART 2: Frontend (Next.js + TypeScript)

#### Step 1: Update authContext

**Update:** `frontend/lib/auth/authContext.tsx`

```typescript
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import axiosInstance from '@/lib/api/axios';

interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Check authentication on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    
    if (token && userStr) {
      try {
        setUser(JSON.parse(userStr));
      } catch (error) {
        console.error('Failed to parse user data');
        localStorage.clear();
      }
    }
    
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string) => {
    try {
      const { data } = await axiosInstance.post('/auth/login', { username, password });
      
      // Store both tokens
      localStorage.setItem('token', data.data.accessToken);
      localStorage.setItem('refreshToken', data.data.refreshToken);
      localStorage.setItem('user', JSON.stringify(data.data.user));
      
      setUser(data.data.user);
      router.push('/');
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  };

  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        await axiosInstance.post('/auth/logout', { refreshToken });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.clear();
      setUser(null);
      router.push('/login');
    }
  };

  const refreshToken = async (): Promise<boolean> => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        return false;
      }

      const { data } = await axiosInstance.post('/auth/refresh', { refreshToken });
      
      // Update access token
      localStorage.setItem('token', data.data.accessToken);
      localStorage.setItem('user', JSON.stringify(data.data.user));
      
      setUser(data.data.user);
      return true;
    } catch (error) {
      console.error('Token refresh failed:', error);
      localStorage.clear();
      setUser(null);
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated: !!user, 
      isLoading, 
      login, 
      logout,
      refreshToken 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
```

---

#### Step 2: Update Axios Interceptor

**Update:** `frontend/lib/api/axios.ts`

```typescript
import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: 'http://localhost:8080/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor
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

// Response interceptor with auto-refresh
axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // If 401 and haven't retried yet
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                // Try to refresh token
                const refreshToken = localStorage.getItem('refreshToken');
                if (!refreshToken) {
                    throw new Error('No refresh token');
                }

                const { data } = await axios.post('http://localhost:8080/api/auth/refresh', {
                    refreshToken
                });

                // Update tokens
                localStorage.setItem('token', data.data.accessToken);
                localStorage.setItem('user', JSON.stringify(data.data.user));

                // Retry original request with new token
                originalRequest.headers.Authorization = `Bearer ${data.data.accessToken}`;
                return axiosInstance(originalRequest);
                
            } catch (refreshError) {
                // Refresh failed - logout
                console.error('Token refresh failed:', refreshError);
                localStorage.clear();
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default axiosInstance;
```

---

#### Step 3: Proactive Token Refresh (Optional but recommended)

**Create:** `frontend/lib/auth/tokenRefresher.ts`

```typescript
import { jwtDecode } from 'jwt-decode';

interface JwtPayload {
  exp: number;
  sub: string;
}

/**
 * Check if token is expiring soon (within 5 minutes)
 */
export function isTokenExpiringSoon(token: string | null): boolean {
  if (!token) return true;
  
  try {
    const decoded = jwtDecode<JwtPayload>(token);
    const expirationTime = decoded.exp * 1000; // Convert to milliseconds
    const now = Date.now();
    const fiveMinutes = 5 * 60 * 1000;
    
    return expirationTime - now < fiveMinutes;
  } catch (error) {
    return true;
  }
}

/**
 * Start automatic token refresh
 */
export function startTokenRefreshTimer(refreshCallback: () => Promise<boolean>) {
  // Check every 1 minute
  const interval = setInterval(async () => {
    const token = localStorage.getItem('token');
    
    if (isTokenExpiringSoon(token)) {
      console.log('[Token Refresher] Token expiring soon, refreshing...');
      const success = await refreshCallback();
      
      if (!success) {
        console.error('[Token Refresher] Failed to refresh token');
        clearInterval(interval);
      }
    }
  }, 60 * 1000); // Every 1 minute
  
  return interval;
}
```

**Install jwt-decode:**
```bash
pnpm install jwt-decode
```

**Update authContext to use auto-refresh:**

```typescript
// In AuthProvider component
useEffect(() => {
  if (isAuthenticated) {
    const interval = startTokenRefreshTimer(refreshToken);
    return () => clearInterval(interval);
  }
}, [isAuthenticated]);
```

---

## ✅ Testing Checklist

### Backend Tests:

1. **Login generates both tokens**
   ```bash
   POST http://localhost:8080/api/auth/login
   Body: { "username": "test", "password": "password" }
   
   Expected Response:
   {
     "data": {
       "accessToken": "eyJhbGc...",
       "refreshToken": "550e8400-e29b-41d4-a716-446655440000",
       "tokenType": "Bearer",
       "expiresIn": 3600
     }
   }
   ```

2. **Refresh token works**
   ```bash
   POST http://localhost:8080/api/auth/refresh
   Body: { "refreshToken": "550e8400-e29b-41d4-a716-446655440000" }
   
   Expected: New access token
   ```

3. **Refresh token expires after 7 days**
   - Check database: `expiryDate` field

4. **Logout revokes refresh token**
   ```bash
   POST http://localhost:8080/api/auth/logout
   Body: { "refreshToken": "..." }
   
   Check DB: revoked = true
   ```

### Frontend Tests:

1. **Login stores both tokens**
   - Check localStorage: `token` and `refreshToken`

2. **Auto-refresh when 401**
   - Wait for access token to expire
   - Make any API call
   - Should auto-refresh and retry

3. **Proactive refresh**
   - Wait ~55 minutes
   - Should refresh before expiration

4. **Logout clears all tokens**
   - localStorage should be empty

---

## 🎯 Success Criteria

- [✅] User login → Receives access + refresh token
- [✅] Access token expires → Auto refresh → User not interrupted
- [✅] Refresh token expires → User must re-login
- [✅] Logout → Refresh token revoked
- [✅] Database stores all refresh tokens
- [✅] Cleanup task removes expired tokens

---

## 📝 Next Steps After Implementation

1. **Test thoroughly** với các scenarios trên
2. **Monitor logs** để đảm bảo không có lỗi
3. **Adjust expiration times** nếu cần (hiện tại: 1h access, 7d refresh)
4. **Implement Email Verification** (feature tiếp theo)

---

**Estimated Time Breakdown:**
- Backend: 4-6 hours
- Frontend: 2-3 hours  
- Testing: 2 hours
- **Total: 8-11 hours** (1-2 working days)

Good luck! 🚀

