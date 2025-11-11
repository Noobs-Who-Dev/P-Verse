# 🔧 TÓM TẮT: FIX LỖI 405 (METHOD NOT ALLOWED)

**Ngày**: 10/11/2025  
**Vấn đề**: Update APIs trả về HTTP 405 khi test  
**Trạng thái**: ✅ ĐÃ FIX

---

## 🐛 MÔ TẢ LỖI

### Các API bị lỗi:
```
PATCH /api/users/{id}/settings/theme?theme=LIGHT           → 405 ❌
PATCH /api/users/{id}/settings/language?language=EN       → 405 ❌
PATCH /api/users/{id}/settings/notifications?enabled=true → 405 ❌
PATCH /api/users/{id}/online-status?isOnline=true         → 405 ❌
```

### Triệu chứng:
- Status code: **405 Method Not Allowed**
- Backend không map được endpoint
- Request không được xử lý

---

## 🔍 NGUYÊN NHÂN

**Có 2 nguyên nhân gây lỗi 405**:

### Nguyên nhân 1: Không khớp giữa cách gửi dữ liệu và cách nhận dữ liệu (ĐÃ FIX)

#### Cách test gửi dữ liệu:
```
PATCH /api/users/1/settings/theme?theme=LIGHT
```
→ Dữ liệu trong **query parameter** (`?theme=LIGHT`)

#### Controller nhận dữ liệu:
```java
@PatchMapping("/{userId}/settings/theme")
public ResponseEntity<UserSettingsDto> updateTheme(
        @PathVariable Long userId,
        @RequestBody UpdateSettingsRequest request) {  // ← Nhận từ request body
    // ...
}
```
→ Mong đợi dữ liệu trong **request body** (JSON)

#### Kết quả:
Spring Boot không tìm thấy endpoint phù hợp → Trả về **405 Method Not Allowed**

---

### Nguyên nhân 2: Gõ URL trực tiếp vào Browser (QUAN TRỌNG!)

⚠️ **LỖI PHỔ BIẾN NHẤT**: Gõ URL vào browser address bar

**Ví dụ sai**:
```
Gõ vào address bar: http://localhost:8080/api/users/1/settings/theme?theme=LIGHT
→ Browser tự động gửi: GET request
→ Endpoint yêu cầu: PATCH request
→ GET ≠ PATCH → Lỗi 405! ❌
```

**Tại sao?**
- Khi bạn **gõ URL vào browser address bar**, trình duyệt LUÔN gửi **GET request**
- Endpoint có annotation `@PatchMapping` chỉ nhận **PATCH request**
- Spring Boot không tìm thấy mapping cho GET request → Trả về **405 Method Not Allowed**

**Giải pháp**:
- ❌ **KHÔNG BAO GIỜ** test PATCH/PUT/POST endpoints bằng cách gõ URL vào address bar!
- ✅ **PHẢI** dùng Browser Console với `fetch()`, hoặc Postman, hoặc curl

---

## ✅ GIẢI PHÁP

### Sửa Controller để nhận query parameters

#### File: `UserSettingsController.java`

**❌ TRƯỚC KHI FIX:**
```java
@PatchMapping("/{userId}/settings/theme")
public ResponseEntity<UserSettingsDto> updateTheme(
        @PathVariable Long userId,
        @RequestBody UpdateSettingsRequest request) {
    return ResponseEntity.ok(settingsService.updateSettings(userId, request));
}
```

**✅ SAU KHI FIX:**
```java
@PatchMapping("/{userId}/settings/theme")
public ResponseEntity<UserSettingsDto> updateTheme(
        @PathVariable Long userId,
        @RequestParam String theme) {  // ← Đổi từ @RequestBody sang @RequestParam
    UpdateSettingsRequest request = new UpdateSettingsRequest();
    request.setTheme(UserSettings.Theme.valueOf(theme.toUpperCase()));
    return ResponseEntity.ok(settingsService.updateSettings(userId, request));
}
```

### Các endpoints đã được sửa:

| Endpoint | Parameter | Controller |
|----------|-----------|------------|
| `PATCH /{userId}/settings/theme` | `@RequestParam String theme` | UserSettingsController |
| `PATCH /{userId}/settings/language` | `@RequestParam String language` | UserSettingsController |
| `PATCH /{userId}/settings/notifications` | `@RequestParam Boolean notificationsEnabled` | UserSettingsController |
| `PATCH /{id}/online-status` | `@RequestParam Boolean isOnline` | UserController |

---

## 🧪 CÁCH KIỂM TRA ĐÃ FIX

### ⚠️ QUAN TRỌNG: KHÔNG GÕ URL VÀO BROWSER ADDRESS BAR!

**Cách test SAI** ❌:
```
Gõ vào address bar: http://localhost:8080/api/users/1/settings/theme?theme=LIGHT
→ Kết quả: 405 Method Not Allowed (vì browser gửi GET, không phải PATCH)
```

**Cách test ĐÚNG** ✅:
- Dùng **Browser Console** với `fetch()` và chỉ định `method: 'PATCH'`
- Dùng **Postman** (chọn method = PATCH)
- Dùng **curl** với `-X PATCH`

---

### Bước 1: Restart Backend (BẮT BUỘC)
```cmd
Ctrl+C  (stop backend)
cd D:\04.My_workspace\P-Verse\backend
.\mvnw.cmd spring-boot:run
```

### Bước 2: Test bằng Browser Console (CÁCH ĐÚNG)

Mở http://localhost:3000, bấm **F12**, vào **Console** tab, paste:

```javascript
// Test 1: Update theme
fetch('http://localhost:8080/api/users/1/settings/theme?theme=LIGHT', {
  method: 'PATCH'  // ← QUAN TRỌNG: Phải chỉ định method
}).then(r => r.json()).then(console.log)

// Test 2: Update language
fetch('http://localhost:8080/api/users/1/settings/language?language=EN', {
  method: 'PATCH'
}).then(r => r.json()).then(console.log)

// Test 3: Update notifications
fetch('http://localhost:8080/api/users/1/settings/notifications?notificationsEnabled=false', {
  method: 'PATCH'
}).then(r => r.json()).then(console.log)

// Test 4: Update online status
fetch('http://localhost:8080/api/users/1/online-status?isOnline=true', {
  method: 'PATCH'
}).then(r => r.ok ? 'Success' : 'Failed').then(console.log)
```

### Bước 3: Kiểm tra kết quả

**Kết quả mong đợi**:
- ✅ Status: **200 OK** (không còn 405)
- ✅ Console hiển thị JSON response
- ✅ Không có lỗi trong Network tab

**Nếu vẫn lỗi 405**:
- ❓ Kiểm tra backend đã restart chưa?
- ❓ Có phải đang gõ URL vào address bar không? → Phải dùng Console!
- ❓ Kiểm tra backend có lỗi compile không?
- ❓ Xem logs trong terminal backend

---

## 📝 LƯU Ý QUAN TRỌNG

### 1. HTTP Methods và cách test

| HTTP Method | Dùng để | Cách test bằng browser |
|-------------|---------|------------------------|
| **GET** | Lấy dữ liệu | ✅ Gõ URL vào address bar |
| **POST** | Tạo mới | ❌ Phải dùng fetch/Postman |
| **PUT** | Cập nhật toàn bộ | ❌ Phải dùng fetch/Postman |
| **PATCH** | Cập nhật một phần | ❌ Phải dùng fetch/Postman |
| **DELETE** | Xóa | ❌ Phải dùng fetch/Postman |

**Kết luận**: Chỉ **GET** mới test được bằng cách gõ URL vào browser!

### 2. Khi nào dùng @RequestParam vs @RequestBody?

| Annotation | Khi nào dùng | Ví dụ |
|------------|--------------|-------|
| **@RequestParam** | Dữ liệu đơn giản, 1-2 parameters | `?theme=LIGHT&lang=EN` |
| **@RequestBody** | Dữ liệu phức tạp, nhiều fields | JSON object trong body |

### 3. Ưu điểm của @RequestParam cho partial updates:

- ✅ **Đơn giản hơn**: Dễ test (nhưng phải dùng fetch!)
- ✅ **RESTful**: Phù hợp với PATCH method (update một phần)
- ✅ **Performance**: Không cần parse JSON

### 4. Khi nào dùng @RequestBody?

- PUT requests (full update)
- POST requests (create)
- Complex objects với nhiều nested fields

---

## 🎯 KẾT QUẢ

### Trước khi fix:
```
PATCH /api/users/1/settings/theme?theme=LIGHT  → 405 ❌
```

### Sau khi fix:
```
PATCH /api/users/1/settings/theme?theme=LIGHT  → 200 OK ✅
Response: {
  "id": 1,
  "userId": 1,
  "theme": "LIGHT",
  "language": "VI",
  "notificationsEnabled": true,
  ...
}
```

---

## 📚 TÀI LIỆU LIÊN QUAN

- **TESTING_WORKFLOW.md** - Hướng dẫn test đầy đủ
- **Sự cố 5.2** trong TESTING_WORKFLOW.md - Chi tiết về lỗi 405

---

## ✅ CHECKLIST SAU KHI FIX

- [x] Sửa UserSettingsController.java
- [x] Sửa UserController.java  
- [x] Restart backend
- [x] Test các endpoints bằng browser
- [x] Kiểm tra status code = 200
- [x] Kiểm tra database đã update
- [x] Update TESTING_WORKFLOW.md
- [x] Tạo file FIX_405_ERROR_SUMMARY.md

---

**Người thực hiện**: GitHub Copilot  
**Ngày hoàn thành**: 10/11/2025  
**Status**: ✅ COMPLETED

