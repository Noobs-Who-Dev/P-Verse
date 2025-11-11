# ⚡ QUICK TEST GUIDE - USER MANAGEMENT

**Mục tiêu**: Test nhanh các tính năng User Management & Settings  
**Thời gian**: 5-10 phút

---

## 🚀 KHỞI ĐỘNG NHANH

### 1️⃣ Start Backend (Terminal 1)
```cmd
cd D:\04.My_workspace\P-Verse\backend
.\mvnw.cmd spring-boot:run
```
Chờ thấy: `Started PVerseApplication in X seconds`

### 2️⃣ Start Frontend (Terminal 2)
```cmd
cd D:\04.My_workspace\P-Verse\frontend
pnpm dev
```
Chờ thấy: `Ready on http://localhost:3000`

### 3️⃣ Kiểm tra Database
```cmd
mysql -u pverse_user -p123 -e "SELECT COUNT(*) FROM pverse_db.users;"
```
Kết quả phải là: **5** users

---

## ✅ TEST CHECKLIST (5 phút)

### Test 1: Backend API (Browser Console)

Mở http://localhost:3000, bấm **F12**, vào **Console**, paste từng dòng:

```javascript
// 1. Get user
fetch('http://localhost:8080/api/users/1').then(r=>r.json()).then(console.log)
// ✅ Mong đợi: JSON với username: "admin"

// 2. Get settings
fetch('http://localhost:8080/api/users/1/settings').then(r=>r.json()).then(console.log)
// ✅ Mong đợi: JSON với theme: "DARK", language: "VI"

// 3. Update theme
fetch('http://localhost:8080/api/users/1/settings/theme?theme=LIGHT', {method:'PATCH'}).then(r=>r.json()).then(console.log)
// ✅ Mong đợi: JSON với theme: "LIGHT"

// 4. Update language
fetch('http://localhost:8080/api/users/1/settings/language?language=EN', {method:'PATCH'}).then(r=>r.json()).then(console.log)
// ✅ Mong đợi: JSON với language: "EN"
```

**Nếu status 405** → Xem file `FIX_405_ERROR_SUMMARY.md`

---

### Test 2: Settings Page (Browser)

1. Truy cập: http://localhost:3000/settings
2. Chọn theme: **Light**
3. Chọn language: **English**
4. Click **Save Changes**
5. Chờ toast: "Settings saved successfully"
6. **Refresh page** (F5)

**✅ Kiểm tra**: Theme và Language vẫn giữ nguyên sau refresh

---

### Test 3: Settings Test Page (Browser)

1. Truy cập: http://localhost:3000/settings-test
2. Click **"Test Theme API"** → Xem toast "Theme API Test"
3. Click **"Test Language API"** → Xem toast "Language API Test"
4. Click **"Test Notifications API"** → Xem toast "Notifications API Test"

**✅ Kiểm tra**: Tất cả đều hiển thị toast thành công

---

### Test 4: Database Verification

```sql
mysql -u pverse_user -p123 pverse_db

-- Xem user 1
SELECT * FROM users WHERE id = 1;

-- Xem settings của user 1
SELECT * FROM user_settings WHERE user_id = 1;

-- Kiểm tra theme và language đã thay đổi
SELECT theme, language FROM user_settings WHERE user_id = 1;
```

**✅ Mong đợi**: 
- theme = 'LIGHT' (hoặc giá trị bạn vừa set)
- language = 'EN' (hoặc giá trị bạn vừa set)

---

## 🐛 TROUBLESHOOTING NHANH

### Lỗi: Port 8080 đã được sử dụng
```cmd
netstat -ano | findstr :8080
taskkill /PID <PID> /F
```

### Lỗi: Port 3000 đã được sử dụng
```cmd
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Lỗi: MySQL không kết nối được
```cmd
net start MySQL80
```

### Lỗi: Status 405 khi test API
→ Backend chưa được restart sau khi fix  
→ Xem `FIX_405_ERROR_SUMMARY.md`

### Lỗi: Status 500 khi load settings
→ Settings chưa tồn tại trong database  
→ Code đã auto-create, restart backend

### Lỗi: CORS Error
→ Kiểm tra CorsConfig.java đã có chưa  
→ Restart backend

---

## 🎯 KẾT QUẢ THÀNH CÔNG

Nếu tất cả test đều PASS:

- ✅ Backend khởi động OK
- ✅ Frontend khởi động OK
- ✅ API endpoints trả về 200 OK
- ✅ Settings page load thành công
- ✅ Thay đổi theme/language được lưu
- ✅ Settings persist sau refresh
- ✅ Database cập nhật đúng

→ **HOÀN THÀNH!** 🎉

---

## 📚 TÀI LIỆU CHI TIẾT

- **TESTING_WORKFLOW.md** - Hướng dẫn test đầy đủ (2000+ dòng)
- **FIX_405_ERROR_SUMMARY.md** - Fix lỗi 405
- **DATABASE_DESIGN_PLAN.md** - Thiết kế database
- **backend/ENTITY_REPOSITORY_SUMMARY.md** - Entity & Repository

---

**Last Updated**: 10/11/2025  
**Status**: ✅ READY TO TEST

