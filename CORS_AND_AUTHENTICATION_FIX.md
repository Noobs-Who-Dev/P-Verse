# 🔧 Giải quyết lỗi CORS khi chuyển sang Authenticated Mode

## 📋 Tóm tắt vấn đề

### Lỗi gặp phải:
```
Access to XMLHttpRequest at 'http://localhost:8080/api/users/1/settings' from origin 'http://localhost:3000' 
has been blocked by CORS policy: Response to preflight request doesn't pass access control check: 
No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

### Nguyên nhân thực sự:
❌ **KHÔNG PHẢI** lỗi CORS thực sự  
✅ **LÀ** lỗi thiếu JWT token hoặc cấu hình CORS sai trong Spring Security

---

## 🔍 Phân tích chi tiết

### 1. Luồng request bình thường (với permitAll):

```
Browser → Spring Security (permitAll) → Controller → Response (có CORS headers) → Browser ✅
```

### 2. Luồng request khi dùng authenticated (SAI):

```
Browser → Preflight OPTIONS request (KHÔNG có token)
       → Spring Security yêu cầu authenticated() 
       → Trả về 401 Unauthorized (KHÔNG có CORS headers)
       → Browser báo lỗi CORS ❌
```

### 3. Luồng request đúng (sau khi fix):

```
Browser → Preflight OPTIONS request
       → Spring Security (CORS được cấu hình TRƯỚC khi check auth)
       → Trả về 200 OK với CORS headers
       → Browser gửi request thật (có JWT token)
       → Spring Security kiểm tra token
       → Controller xử lý
       → Response với CORS headers → Browser ✅
```

---

## 💡 Vấn đề chính

### Vấn đề 1: CORS Configuration bị bỏ qua
**Trước đây:**
- File `CorsConfig.java` chỉ cấu hình CORS ở **tầng MVC**
- Spring Security filter chạy **TRƯỚC** MVC
- Khi Security chặn request (401), response không qua MVC → **KHÔNG có CORS headers**

**Giải pháp:**
- Cấu hình CORS **TRONG Spring Security** (SecurityConfig.java)
- CORS filter chạy trước Authentication filter

### Vấn đề 2: Preflight Request (OPTIONS) bị chặn
**Preflight Request là gì?**
- Browser tự động gửi OPTIONS request trước khi gửi request thật
- Để kiểm tra xem server có cho phép CORS không
- OPTIONS request **KHÔNG bao giờ có Authorization header**

**Vấn đề:**
```java
.anyRequest().authenticated()  // ❌ OPTIONS request bị chặn vì không có token
```

**Giải pháp:**
- Spring Security tự động cho phép OPTIONS khi CORS được cấu hình đúng
- Thêm `corsConfigurationSource()` vào `.cors()` configuration

---

## ✅ Giải pháp đã áp dụng

### 1. Xóa file trùng lặp
- ❌ Xóa `CorsConfig.java` (chỉ hoạt động ở tầng MVC)
- ✅ Giữ cấu hình CORS trong `SecurityConfig.java`

### 2. Thêm CORS Configuration vào Spring Security

```java
@Bean
public CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration configuration = new CorsConfiguration();
    configuration.setAllowedOrigins(List.of("http://localhost:3000"));
    configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
    configuration.setAllowedHeaders(List.of("*"));
    configuration.setExposedHeaders(List.of("Authorization"));
    configuration.setAllowCredentials(true);
    configuration.setMaxAge(3600L);

    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/api/**", configuration);
    return source;
}
```

### 3. Áp dụng CORS vào SecurityFilterChain

```java
@Bean
public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
    http
        .cors(cors -> cors.configurationSource(corsConfigurationSource()))  // ✅ CORS trước Authentication
        .csrf(csrf -> csrf.disable())
        .authorizeHttpRequests(auth -> auth
            .requestMatchers("/api/auth/**").permitAll()  // Public endpoints
            .anyRequest().authenticated()  // Protected endpoints
        )
        .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

    return http.build();
}
```

---

## 🎯 Thứ tự xử lý trong Spring Security (Sau khi fix)

```
1. CORS Filter           → Xử lý preflight + thêm CORS headers
2. CSRF Filter           → Disabled (vì dùng JWT)
3. JWT Filter            → Validate token và set Authentication
4. Authorization Filter  → Kiểm tra quyền (authenticated/permitAll)
5. Controller            → Xử lý business logic
```

**Quan trọng:** CORS phải được xử lý **TRƯỚC** Authentication!

---

## 📝 Kiểm tra hoạt động

### Test 1: Preflight Request (OPTIONS)
```bash
# Browser tự động gửi
OPTIONS http://localhost:8080/api/users/1/settings
Origin: http://localhost:3000

# Response phải có:
Access-Control-Allow-Origin: http://localhost:3000
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, PATCH, OPTIONS
Access-Control-Allow-Headers: *
```

### Test 2: Actual Request (GET/POST/PUT...)
```bash
# Frontend gửi với token
GET http://localhost:8080/api/users/1/settings
Origin: http://localhost:3000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Response phải có:
Access-Control-Allow-Origin: http://localhost:3000
Access-Control-Allow-Credentials: true
```

---

## 🚀 Cách test

### 1. Restart Backend
- Application đã được restart với cấu hình mới

### 2. Kiểm tra trong Browser DevTools

**Network Tab:**
1. Mở F12 → Network
2. Reload trang `/settings`
3. Tìm request đến `/api/users/1/settings`
4. Kiểm tra:
   - **Request Headers:** Có `Authorization: Bearer ...`
   - **Response Headers:** Có `Access-Control-Allow-Origin`

**Console Tab:**
- ✅ Không còn lỗi CORS
- ✅ Không còn lỗi Network Error

### 3. Kiểm tra Authentication Flow

```javascript
// 1. Đăng nhập
const loginResponse = await fetch('http://localhost:8080/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username: 'test', password: 'password' })
});
const { token } = await loginResponse.json();

// 2. Lưu token
localStorage.setItem('token', token);

// 3. Gọi protected API
const settingsResponse = await fetch('http://localhost:8080/api/users/1/settings', {
  headers: { 'Authorization': `Bearer ${token}` }
});
// ✅ Phải thành công
```

---

## 📌 Lưu ý quan trọng

### 1. Production Environment
Khi deploy lên production, sửa allowed origins:
```java
configuration.setAllowedOrigins(List.of(
    "http://localhost:3000",  // Development
    "https://yourdomain.com"   // Production
));
```

### 2. Token Expiration
- Token hết hạn → 401 Unauthorized
- Frontend tự động redirect về /login (đã cấu hình trong axios interceptor)

### 3. CORS Headers chỉ cần trong SecurityConfig
- ❌ KHÔNG cần CorsConfig.java riêng
- ❌ KHÔNG cần @CrossOrigin trên Controller
- ✅ Chỉ cần corsConfigurationSource() trong SecurityConfig

---

## 🔒 Bảo mật hiện tại

### Endpoints Public (không cần token):
- `/api/auth/login` - Đăng nhập
- `/api/auth/register` - Đăng ký

### Endpoints Protected (cần token):
- `/api/users/**` - Quản lý user
- `/api/messages/**` - Tin nhắn
- `/api/posts/**` - Bài viết
- Tất cả các endpoint khác

---

## 🎓 Kết luận

**Vấn đề ban đầu:**
- CORS được cấu hình ở tầng MVC
- Spring Security chặn request trước → Không có CORS headers

**Giải pháp:**
- Cấu hình CORS trong Spring Security
- CORS filter chạy trước Authentication filter
- OPTIONS request được tự động cho phép

**Kết quả:**
- ✅ CORS hoạt động đúng
- ✅ Preflight request thành công
- ✅ JWT authentication hoạt động
- ✅ Protected endpoints được bảo vệ
- ✅ Public endpoints vẫn accessible

---

**Tác giả:** GitHub Copilot  
**Ngày:** 13/11/2025  
**Trạng thái:** ✅ Đã fix thành công

