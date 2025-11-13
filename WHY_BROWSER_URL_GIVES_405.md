# 📘 HƯỚNG DẪN: TẠI SAO GÕ URL VÀO BROWSER BỊ LỖI 405?

**Câu hỏi phổ biến**: _"Tại sao khi tôi test bằng đường link `http://localhost:8080/api/users/1/settings/theme?theme=LIGHT` trên browser thì bị lỗi 405, còn test trên Console log thì lại được?"_

---

## 🔍 GIẢI THÍCH NGẮN GỌN

### Khi bạn gõ URL vào browser:
```
Gõ: http://localhost:8080/api/users/1/settings/theme?theme=LIGHT
→ Browser tự động gửi: GET request ❌
→ Endpoint yêu cầu: PATCH request
→ GET ≠ PATCH → Lỗi 405 Method Not Allowed
```

### Khi bạn dùng Console với fetch():
```javascript
fetch('http://localhost:8080/api/users/1/settings/theme?theme=LIGHT', {
  method: 'PATCH'  // ← Chỉ định đúng method
})
→ Browser gửi: PATCH request ✅
→ Endpoint nhận: PATCH request
→ PATCH = PATCH → OK 200
```

---

## 📚 KIẾN THỨC NỀN TẢNG

### HTTP Methods là gì?

HTTP có 5 methods (động từ) chính:

| Method | Dùng để | Ví dụ |
|--------|---------|-------|
| **GET** | Lấy dữ liệu (đọc) | Xem thông tin user |
| **POST** | Tạo mới | Tạo user mới |
| **PUT** | Cập nhật toàn bộ | Thay đổi tất cả thông tin user |
| **PATCH** | Cập nhật một phần | Chỉ thay đổi theme |
| **DELETE** | Xóa | Xóa user |

### Browser gửi method nào khi bạn gõ URL?

**Luôn luôn là GET!**

```
Gõ vào address bar: http://example.com/anything
→ Browser gửi: GET request

Không có cách nào gõ URL vào address bar để gửi POST/PUT/PATCH/DELETE!
```

---

## ⚠️ VÍ DỤ CỤ THỂ

### Endpoint của bạn:

```java
@PatchMapping("/{userId}/settings/theme")
public ResponseEntity<UserSettingsDto> updateTheme(
        @PathVariable Long userId,
        @RequestParam String theme) {
    // ...
}
```

→ Endpoint này chỉ nhận **PATCH request**

### Test case 1: Gõ URL vào browser ❌

```
Hành động: Gõ http://localhost:8080/api/users/1/settings/theme?theme=LIGHT vào address bar

Browser gửi:
  Method: GET
  URL: /api/users/1/settings/theme?theme=LIGHT

Server tìm kiếm:
  @GetMapping("/{userId}/settings/theme")  ← Không tìm thấy!
  
Kết quả: 405 Method Not Allowed ❌
Lỗi: "This application has no explicit mapping for /error..."
```

### Test case 2: Dùng Console với fetch() ✅

```javascript
fetch('http://localhost:8080/api/users/1/settings/theme?theme=LIGHT', {
  method: 'PATCH'
})
```

```
Browser gửi:
  Method: PATCH  ← Đúng!
  URL: /api/users/1/settings/theme?theme=LIGHT

Server tìm kiếm:
  @PatchMapping("/{userId}/settings/theme")  ← Tìm thấy! ✅
  
Kết quả: 200 OK ✅
Response: { "theme": "LIGHT", ... }
```

---

## ✅ CÁCH TEST ĐÚNG

### 1. Dùng Browser Console (Đơn giản nhất)

Mở http://localhost:3000, bấm **F12**, vào **Console**, paste:

```javascript
// PATCH request
fetch('http://localhost:8080/api/users/1/settings/theme?theme=LIGHT', {
  method: 'PATCH'
}).then(r => r.json()).then(console.log)
```

### 2. Dùng Postman

1. Mở Postman
2. Chọn method: **PATCH**
3. Nhập URL: `http://localhost:8080/api/users/1/settings/theme?theme=LIGHT`
4. Click **Send**

### 3. Dùng curl (Terminal)

```bash
curl -X PATCH "http://localhost:8080/api/users/1/settings/theme?theme=LIGHT"
```

### 4. Dùng Browser Extension

- **Advanced REST Client** (Chrome Extension)
- **RESTer** (Firefox Addon)

---

## 📊 BẢNG TỔNG HỢP

### Các endpoint và cách test

| Endpoint | Method | Gõ URL vào browser | Dùng fetch() |
|----------|--------|-------------------|--------------|
| `/api/users/1` | GET | ✅ OK | ✅ OK |
| `/api/users/1/settings` | GET | ✅ OK | ✅ OK |
| `/api/users/1/settings/theme` | PATCH | ❌ Lỗi 405 | ✅ OK |
| `/api/users/1/settings/language` | PATCH | ❌ Lỗi 405 | ✅ OK |
| `/api/users/1` | PUT | ❌ Lỗi 405 | ✅ OK |
| `/api/users` | POST | ❌ Lỗi 405 | ✅ OK |

**Kết luận**: Chỉ có **GET** mới test được bằng cách gõ URL!

---

## 💡 TẠI SAO LẠI THIẾT KẾ NHƯ VẬY?

### Lý do browser chỉ gửi GET khi gõ URL:

1. **An toàn**: GET chỉ đọc dữ liệu, không thay đổi gì
2. **Có thể bookmark**: Bạn có thể lưu GET URL vào bookmark
3. **SEO-friendly**: Search engines chỉ crawl GET requests
4. **Cache được**: Browser có thể cache GET responses

### Tại sao POST/PUT/PATCH/DELETE cần thận trọng hơn?

1. **Thay đổi dữ liệu**: Có thể tạo/sửa/xóa data
2. **Cần xác thực**: Thường cần authentication/authorization
3. **Không cache**: Không nên cache vì data có thể thay đổi
4. **Cần ý định rõ ràng**: Phải chủ động gọi, không phải vô tình

---

## 🎓 BÀI HỌC

### Nguyên tắc vàng:

1. **GET endpoints** → Có thể test bằng cách gõ URL vào browser
2. **POST/PUT/PATCH/DELETE endpoints** → PHẢI dùng fetch/Postman/curl

### Cách nhớ nhanh:

```
Gõ URL vào browser = GET request
Muốn dùng method khác = Phải dùng fetch() với method: '...'
```

---

## 🔗 TÀI LIỆU THAM KHẢO

- **FIX_405_ERROR_SUMMARY.md** - Chi tiết về lỗi 405
- **TESTING_WORKFLOW.md** - Hướng dẫn test đầy đủ (xem FAQ Q6)
- **QUICK_TEST_GUIDE.md** - Test nhanh 5 phút

---

## ✅ TÓM TẮT

**Câu hỏi**: Tại sao gõ URL vào browser bị 405?  
**Trả lời**: Vì browser gửi GET, nhưng endpoint cần PATCH.

**Giải pháp**: Dùng Console với fetch() và chỉ định `method: 'PATCH'`

```javascript
// ✅ CÁCH ĐÚNG
fetch('http://localhost:8080/api/users/1/settings/theme?theme=LIGHT', {
  method: 'PATCH'
}).then(r => r.json()).then(console.log)

// ❌ CÁCH SAI
// Gõ URL vào address bar → Lỗi 405!
```

---

**Hy vọng bạn đã hiểu! 🎉**

