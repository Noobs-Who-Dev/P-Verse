# 🚀 WORKFLOW HOÀN CHỈNH - USER MANAGEMENT TESTING & TROUBLESHOOTING

**Dự án**: P-Verse  
**Module**: User Management & Settings  
**Ngày cập nhật**: 10 tháng 11, 2025  
**Trạng thái**: ✅ SẴN SÀNG TEST - ✅ ĐÃ FIX CÁC LỖI QUAN TRỌNG

---

## 📋 MỤC LỤC

### PHẦN I: TESTING WORKFLOW
1. [Tổng quan](#tổng-quan)
2. [Yêu cầu hệ thống](#yêu-cầu-hệ-thống)
3. [Bước 1: Cài đặt Database](#bước-1-cài-đặt-database)
4. [Bước 2: Tạo người dùng test](#bước-2-tạo-người-dùng-test)
5. [Bước 3: Khởi động Backend](#bước-3-khởi-động-backend)
6. [Bước 4: Khởi động Frontend](#bước-4-khởi-động-frontend)
7. [Bước 5: Test các tính năng](#bước-5-test-các-tính-năng)

### PHẦN II: TROUBLESHOOTING & FIXES
8. [Fix: Theme Toggle Bounce Back](#fix-theme-toggle-bounce-back)
9. [Fix: Settings Không Persist](#fix-settings-không-persist)
10. [Quick Test Scripts](#quick-test-scripts)
11. [Xử lý sự cố thường gặp](#xử-lý-sự-cố-thường-gặp)

---

# PHẦN I: TESTING WORKFLOW

## 🎯 TỔNG QUAN

### Mục tiêu
Test đầy đủ các tính năng User Management và Settings của hệ thống P-Verse.

### Các tính năng sẽ test
- ✅ Quản lý thông tin người dùng (User Management)
- ✅ Cài đặt người dùng (User Settings)
- ✅ Thay đổi theme (LIGHT/DARK/AUTO) - **ĐÃ FIX BOUNCE BACK BUG**
- ✅ Thay đổi ngôn ngữ (EN/VI)
- ✅ Toggle notifications
- ✅ Lưu và phục hồi cài đặt - **ĐÃ FIX PERSISTENCE ISSUES**
- ✅ API endpoints (12 endpoints)

### Thời gian dự kiến
- **Cài đặt**: 5-10 phút
- **Testing**: 10-15 phút
- **Tổng**: 15-25 phút

---

## 💻 YÊU CẦU HỆ THỐNG

### Phần mềm cần thiết

| Phần mềm | Phiên bản | Kiểm tra |
|----------|-----------|----------|
| **MySQL Server** | 8.0+ | `mysql --version` |
| **Java** | 17+ | `java -version` |
| **Node.js** | 18+ | `node --version` |
| **pnpm** | Latest | `pnpm --version` |

### Kiểm tra cài đặt
```cmd
mysql --version
java -version
node --version
pnpm --version
```

### Cổng (Ports) cần thiết
- **MySQL**: 3306
- **Backend**: 8080
- **Frontend**: 3000

---

## 🗄️ BƯỚC 1: CÀI ĐẶT DATABASE

### 1.1. Khởi động MySQL Server

```cmd
# Kiểm tra MySQL đang chạy
net start | findstr MySQL

# Nếu chưa chạy, khởi động MySQL
net start MySQL80
```

---

### 1.2. Tạo Database và User

**Kết nối vào MySQL với quyền root:**
```cmd
mysql -u root -p
```

**Chạy các lệnh SQL sau:**
```sql
-- Tạo database
CREATE DATABASE IF NOT EXISTS pverse_db 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

-- Tạo user
CREATE USER IF NOT EXISTS 'pverse_user'@'localhost' 
IDENTIFIED BY '123';

-- Cấp quyền
GRANT ALL PRIVILEGES ON pverse_db.* TO 'pverse_user'@'localhost';
FLUSH PRIVILEGES;

-- Kiểm tra
SHOW DATABASES;
SELECT User, Host FROM mysql.user WHERE User = 'pverse_user';

-- Thoát
exit;
```

---

### 1.3. Kiểm tra kết nối

```cmd
mysql -u pverse_user -p123 -e "SELECT 'Connection successful!' AS Status;"
```

**Kết quả mong đợi:** `Connection successful!`

---

## 👥 BƯỚC 2: TẠO NGƯỜI DÙNG TEST

### 2.1. Kết nối vào Database

```cmd
mysql -u pverse_user -p123 pverse_db
```

---

### 2.2. Xóa dữ liệu cũ (nếu có)

```sql
DELETE FROM user_settings WHERE user_id IN (1,2,3,4,5);
DELETE FROM users WHERE id IN (1,2,3,4,5);
```

---

### 2.3. Tạo 5 Test Users

```sql
INSERT INTO users (username, email, password, display_name, bio, avatar_url, phone_number, is_online, last_seen_at, created_at, updated_at) VALUES
('admin', 'admin@pverse.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Administrator', 'Quản trị viên hệ thống', NULL, NULL, false, NOW(), NOW(), NOW()),
('nguyenvana', 'nguyenvana@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Nguyễn Văn A', 'Developer từ Hà Nội', 'https://i.pravatar.cc/150?img=1', '0901234567', false, NOW(), NOW(), NOW()),
('tranthib', 'tranthib@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Trần Thị B', 'Designer & Nghệ sĩ', 'https://i.pravatar.cc/150?img=2', '0902345678', true, NOW(), NOW(), NOW()),
('lequangc', 'lequangc@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Lê Quang C', 'Kỹ sư phần mềm', 'https://i.pravatar.cc/150?img=3', '0903456789', false, NOW(), NOW(), NOW()),
('phamthid', 'phamthid@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Phạm Thị D', 'Sinh viên & Nhiếp ảnh gia', 'https://i.pravatar.cc/150?img=4', NULL, true, NOW(), NOW(), NOW());
```

---

### 2.4. Tạo User Settings

```sql
INSERT INTO user_settings (user_id, theme, language, notifications_enabled, extended_settings, created_at, updated_at) VALUES
(1, 'DARK', 'VI', true, '{"emailNotifications": true, "pushNotifications": true, "privacyLevel": "PUBLIC"}', NOW(), NOW()),
(2, 'LIGHT', 'VI', true, '{"emailNotifications": true, "pushNotifications": false, "privacyLevel": "PUBLIC"}', NOW(), NOW()),
(3, 'DARK', 'EN', false, '{"emailNotifications": false, "pushNotifications": true, "privacyLevel": "FRIENDS_ONLY"}', NOW(), NOW()),
(4, 'LIGHT', 'EN', true, '{"emailNotifications": true, "pushNotifications": true, "privacyLevel": "PRIVATE"}', NOW(), NOW()),
(5, 'AUTO', 'VI', true, '{"emailNotifications": false, "pushNotifications": false, "privacyLevel": "PUBLIC"}', NOW(), NOW());
```

---

### 2.5. Kiểm tra dữ liệu đã tạo

```sql
-- Kiểm tra users
SELECT id, username, display_name, is_online FROM users ORDER BY id;

-- Kiểm tra settings
SELECT user_id, theme, language, notifications_enabled FROM user_settings ORDER BY user_id;

-- Thoát
exit;
```

---

### 2.6. Thông tin đăng nhập Test Users

| ID | Username | Password | Email | Theme | Language |
|----|----------|----------|-------|-------|----------|
| 1 | admin | admin123 | admin@pverse.com | DARK | VI |
| 2 | nguyenvana | password123 | nguyenvana@example.com | LIGHT | VI |
| 3 | tranthib | password123 | tranthib@example.com | DARK | EN |
| 4 | lequangc | password123 | lequangc@example.com | LIGHT | EN |
| 5 | phamthid | password123 | phamthid@example.com | AUTO | VI |

---

## 🔧 BƯỚC 3: KHỞI ĐỘNG BACKEND

### 3.1. Mở Terminal và chạy Backend

```cmd
cd D:\04.My_workspace\P-Verse\backend
.\mvnw.cmd spring-boot:run
```

**Kết quả mong đợi:**
```
Started PVerseApplication in 5.123 seconds
Tomcat started on port(s): 8080 (http)
```

---

### 3.2. Kiểm tra Backend

Mở trình duyệt: `http://localhost:8080/api/users/1`

**Kết quả mong đợi:** JSON với thông tin user 1

---

## 🎨 BƯỚC 4: KHỞI ĐỘNG FRONTEND

### 4.1. Mở Terminal mới

```cmd
cd D:\04.My_workspace\P-Verse\frontend
pnpm dev
```

**Kết quả mong đợi:**
```
✓ Ready in 2.5s
Local: http://localhost:3000
```

---

### 4.2. Kiểm tra Frontend

Mở trình duyệt: `http://localhost:3000`

**Kết quả mong đợi:** Trang chủ P-Verse hiển thị

---

## 🧪 BƯỚC 5: TEST CÁC TÍNH NĂNG

### 5.1. Settings Test Page (Recommended)

**URL**: `http://localhost:3000/settings-test`

#### Checklist:
- [ ] Page loads không lỗi
- [ ] Current settings hiển thị đúng
- [ ] Có 3 API test buttons
- [ ] Thay đổi Theme → Click Save → Success toast
- [ ] Thay đổi Language → Click Save → Success toast
- [ ] Toggle Notifications → Click Save → Success toast
- [ ] Click "Test Theme API" → Status 200
- [ ] Click "Test Language API" → Status 200
- [ ] Click "Test Notifications API" → Status 200
- [ ] Refresh page → Settings persist

---

### 5.2. Settings Page (Production)

**URL**: `http://localhost:3000/settings`

#### Test Theme Toggle (ĐÃ FIX BOUNCE BACK BUG):
1. **Mở DevTools** (F12) → Tab Network
2. **Click theme toggle** (Light ↔ Dark)
3. **Kiểm tra:**
   - ✅ Theme thay đổi ngay lập tức
   - ✅ **KHÔNG bị bounce back**
   - ✅ KHÔNG có API call trong Network tab
   - ✅ Console log: `[Theme Toggle] Toggling theme to: dark`

4. **Click "Save Changes"**
5. **Kiểm tra:**
   - ✅ Network: 1 PUT request với status 200
   - ✅ Toast: "Settings saved successfully!"
   - ✅ hasUnsavedChanges → false

6. **Refresh page (F5)**
7. **Kiểm tra:**
   - ✅ Theme được giữ nguyên
   - ✅ Settings persist từ database

---

### 5.3. Backend API Tests

Trong Browser, test các endpoints:

```
✅ User APIs:
http://localhost:8080/api/users/1
http://localhost:8080/api/users/username/admin

✅ Settings APIs:
http://localhost:8080/api/users/1/settings
http://localhost:8080/api/users/2/settings
```

---

# PHẦN II: TROUBLESHOOTING & FIXES

## 🔥 FIX: THEME TOGGLE BOUNCE BACK

### ❌ Vấn đề
Khi click toggle theme, theme chuyển sang chế độ mới nhưng **ngay lập tức bật ngược lại** về chế độ cũ.

### 🔍 Nguyên nhân cốt lõi

**Settings API được gọi 2 lần** khi click toggle:

```
User clicks toggle → setLocalTheme("dark") → setTheme("dark")
                   ↓
            ThemeProvider re-renders
                   ↓
            Settings page re-renders
                   ↓
            useEffect runs again → Load settings from backend (theme: "light")
                   ↓
            Override user's change → BOUNCE BACK! ❌
```

**Root causes:**
1. `setTheme` trong useEffect dependency array → Trigger re-load mỗi khi theme change
2. ThemeProvider re-render toàn bộ app khi theme thay đổi
3. Không có cơ chế ngăn double load settings

---

### ✅ Giải pháp đã áp dụng

#### 1. Sử dụng useRef để track trạng thái

```typescript
const hasLoadedSettings = useRef(false);
```

#### 2. Chỉ load settings 1 lần duy nhất

```typescript
useEffect(() => {
  // Only load settings once
  if (hasLoadedSettings.current) {
    console.log('[Settings] Skipping reload - already loaded');
    return;
  }

  const loadSettings = async () => {
    const data = await settingsService.getSettings(userId);
    // ...
    hasLoadedSettings.current = true; // Mark as loaded
  };
  loadSettings();
}, [userId]); // KHÔNG có setTheme trong dependencies
```

#### 3. Remove useEffect sync với next-themes

Bỏ useEffect sync `localTheme` với `nextTheme` - nguồn gây race condition.

#### 4. Sử dụng Local Theme State

```typescript
const { theme: nextTheme, setTheme } = useTheme();
const [localTheme, setLocalTheme] = useState<string>("");

// Switch uses localTheme (synchronous)
<Switch 
  checked={localTheme === "dark"}
  onCheckedChange={handleThemeToggle}
/>

// Handler updates both states
const handleThemeToggle = (checked: boolean) => {
  const newTheme = checked ? "dark" : "light";
  setLocalTheme(newTheme);  // Update UI immediately (sync)
  setTheme(newTheme);       // Update next-themes (async)
};
```

---

### 🧪 Cách test fix

#### Bước 1: Clear console và Network tab
- Mở DevTools (F12)
- Clear Console
- Tab Network → Filter: `settings`

#### Bước 2: Load settings page
```
http://localhost:3000/settings
```

**Expected:**
- Console: `[Settings] Loading settings from backend...`
- Network: 1 request đến `/api/users/1/settings`

#### Bước 3: Click toggle theme nhiều lần

**Expected:**
- ✅ Console: `[Theme Toggle] Toggling theme to: dark`
- ✅ **KHÔNG có** request mới trong Network tab
- ✅ **KHÔNG có** log `[Settings] Loading settings...`
- ✅ Theme thay đổi ngay lập tức
- ✅ **KHÔNG bị bounce back**

#### Bước 4: Test Save & Persistence
1. Toggle theme
2. Click "Save Changes"
3. Refresh page (F5)

**Expected:**
- ✅ Network: 1 PUT request khi save
- ✅ Toast: "Settings saved successfully!"
- ✅ Theme persist sau refresh

---

### 📊 Flow hoạt động sau khi fix

```
1. User clicks Switch
   ↓
2. handleThemeToggle() called
   ↓
3. setLocalTheme(newTheme)  ← Update UI immediately (sync)
   ↓
4. setTheme(newTheme)  ← Update next-themes (async)
   ↓
5. ThemeProvider re-renders (apply theme to DOM)
   ↓
6. Settings page may re-render
   ↓
7. useEffect check: hasLoadedSettings.current === true
   ↓
8. Skip loading → No API call → No bounce back! ✅
```

---

## 🔧 FIX: SETTINGS KHÔNG PERSIST

### ❌ Vấn đề
- Save changes thành công
- Refresh page hoặc click theme toggle
- Settings quay về giá trị cũ

### 🔍 Nguyên nhân

```typescript
// ❌ VẤN ĐỀ
// originalSettings.theme = "" (empty string)
// Khi theme mount từ next-themes, nó không update originalSettings
// Nên khi so sánh, luôn luôn có changes
```

### ✅ Giải pháp

**Track changes sử dụng localTheme:**

```typescript
useEffect(() => {
  // Only track after initial load
  if (isLoading || !localTheme) return;
  
  const themeChanged = localTheme !== originalSettings.theme;
  const languageChanged = language !== originalSettings.language;
  const notificationsChanged = notificationSettings.desktopNotifications !== originalSettings.notificationsEnabled;

  setHasUnsavedChanges(themeChanged || languageChanged || notificationsChanged);
}, [localTheme, language, notificationSettings.desktopNotifications, originalSettings, isLoading]);
```

**Update originalSettings khi save:**

```typescript
const handleSaveChanges = async () => {
  const settingsData = {
    theme: localTheme.toUpperCase(),
    language: language === 'vi' ? 'VI' : 'EN',
    notificationsEnabled: notificationSettings.desktopNotifications
  };

  await settingsService.updateSettings(userId, settingsData);

  // Update original settings
  setOriginalSettings({
    theme: localTheme,
    language: language,
    notificationsEnabled: notificationSettings.desktopNotifications
  });

  setHasUnsavedChanges(false);
};
```

---

## 🚀 QUICK TEST SCRIPTS

### SQL Quick Checks

```sql
-- Kết nối
mysql -u pverse_user -p123 pverse_db

-- Kiểm tra tổng quan
SELECT 'Users' as Table_Name, COUNT(*) as Count FROM users
UNION ALL
SELECT 'Settings', COUNT(*) FROM user_settings;

-- Xem chi tiết users + settings
SELECT 
    u.id,
    u.username,
    u.display_name,
    us.theme,
    us.language,
    us.notifications_enabled
FROM users u
LEFT JOIN user_settings us ON u.id = us.user_id
ORDER BY u.id;
```

---

### Browser Console Tests

```javascript
// Test 1: Fetch user settings
fetch('http://localhost:8080/api/users/1/settings')
  .then(r => r.json())
  .then(data => console.log('✅ Settings:', data))
  .catch(err => console.error('❌ Error:', err));

// Test 2: Update theme
fetch('http://localhost:8080/api/users/1/settings/theme', {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ theme: 'DARK' })
})
  .then(r => r.json())
  .then(data => console.log('✅ Theme updated:', data));

// Test 3: Update full settings
fetch('http://localhost:8080/api/users/1/settings', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    theme: 'LIGHT',
    language: 'EN',
    notificationsEnabled: true
  })
})
  .then(r => r.json())
  .then(data => console.log('✅ Settings updated:', data));
```

---

## 🐛 XỬ LÝ SỰ CỐ THƯỜNG GẶP

### Sự cố 1: Backend không khởi động

**Triệu chứng:** Error khi chạy `mvnw spring-boot:run`

**Giải pháp:**
```cmd
# Kiểm tra MySQL đang chạy
net start | findstr MySQL

# Kiểm tra port 8080
netstat -ano | findstr :8080

# Clean và rebuild
.\mvnw.cmd clean install
```

---

### Sự cố 2: Frontend không kết nối được Backend

**Triệu chứng:** CORS errors trong console

**Giải pháp:**
1. Kiểm tra Backend đang chạy: `http://localhost:8080/api/users/1`
2. Kiểm tra `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api
```
3. Restart frontend: `pnpm dev`

---

### Sự cố 3: Settings không load

**Triệu chứng:** 500 Internal Server Error

**Giải pháp:**
```sql
-- Kiểm tra user_settings table tồn tại
mysql -u pverse_user -p123 pverse_db

SHOW TABLES;
DESCRIBE user_settings;

-- Kiểm tra data
SELECT * FROM user_settings WHERE user_id = 1;
```

---

### Sự cố 4: Theme toggle vẫn bị bounce back

**Debug Steps:**

1. **Check console logs:**
   - Có nhiều hơn 1 log `[Settings] Loading...`?
   - Có log `[Settings] Skipping reload...` khi toggle?

2. **Check Network tab:**
   - Có bao nhiêu request đến `/settings`?
   - Request nào được gọi khi toggle?

3. **Clear browser cache:**
   - Hard refresh: Ctrl + Shift + R
   - Clear site data

4. **Check code:**
   - `hasLoadedSettings.current` được set đúng chưa?
   - `localTheme` được sử dụng trong Switch?

---

## ✅ CHECKLIST HOÀN CHỈNH

### Database Setup
- [ ] MySQL đang chạy
- [ ] Database `pverse_db` đã tạo
- [ ] User `pverse_user` đã tạo
- [ ] 5 test users đã insert
- [ ] 5 user_settings đã insert

### Backend
- [ ] Backend khởi động thành công
- [ ] Port 8080 available
- [ ] API `/api/users/1` trả về 200
- [ ] API `/api/users/1/settings` trả về 200

### Frontend
- [ ] Frontend khởi động thành công
- [ ] Port 3000 available
- [ ] Page `/settings` load thành công
- [ ] Page `/settings-test` load thành công

### Features
- [ ] Theme toggle không bounce back
- [ ] Settings persist sau refresh
- [ ] Save Changes thành công
- [ ] API test buttons hoạt động
- [ ] Console không có errors
- [ ] Network requests chính xác

---

## 📝 NOTES

### Key Points về Theme Toggle Fix

1. **hasLoadedSettings.current** ngăn load settings nhiều lần
2. **localTheme** là source of truth cho UI (synchronous)
3. **nextTheme** chỉ để apply theme vào DOM (asynchronous)
4. **Không có setTheme** trong useEffect dependencies

### Files đã modified

- `frontend/app/settings/page.tsx` - Added refs, fixed useEffect dependencies
- Backend không cần thay đổi

### Logging để debug

Console logs đã được thêm để debug:
- `[Settings] Loading settings from backend...`
- `[Settings] Skipping reload - already loaded`
- `[Theme Toggle] Toggling theme to: dark`
- `[Theme Toggle] Toggle complete`

**Có thể remove sau khi test xong.**

---

## 🎯 KẾT LUẬN

✅ **Đã sửa thành công:**
- Theme toggle bounce back bug
- Settings persistence issues
- Double API call problem

✅ **Workflow hoàn chỉnh:**
- Setup database
- Create test users
- Start backend & frontend
- Test all features
- Debug & troubleshoot

✅ **Ready for production testing!**

---

**Phiên bản**: 2.0 - Updated 10/11/2025
**Tác giả**: P-Verse Development Team

**Copy và paste đoạn SQL sau:**

```sql
-- Tạo cài đặt cho từng người dùng
INSERT INTO user_settings (user_id, theme, language, notifications_enabled, extended_settings, created_at, updated_at) VALUES
(1, 'DARK', 'VI', true, '{"emailNotifications": true, "pushNotifications": true, "privacyLevel": "PUBLIC"}', NOW(), NOW()),
(2, 'LIGHT', 'VI', true, '{"emailNotifications": true, "pushNotifications": false, "privacyLevel": "PUBLIC"}', NOW(), NOW()),
(3, 'DARK', 'EN', false, '{"emailNotifications": false, "pushNotifications": true, "privacyLevel": "FRIENDS_ONLY"}', NOW(), NOW()),
(4, 'LIGHT', 'EN', true, '{"emailNotifications": true, "pushNotifications": true, "privacyLevel": "PRIVATE"}', NOW(), NOW()),
(5, 'AUTO', 'VI', true, '{"emailNotifications": false, "pushNotifications": false, "privacyLevel": "PUBLIC"}', NOW(), NOW());
```

**Kết quả mong đợi**:
```
Query OK, 5 rows affected (0.01 sec)
Records: 5  Duplicates: 0  Warnings: 0
```

---

### 2.5. Kiểm tra dữ liệu đã tạo

### 2.5. Kiểm tra dữ liệu đã tạo

**Bước 1: Kiểm tra số lượng users**
```sql
SELECT COUNT(*) AS total_users FROM users;
```
**Kết quả mong đợi**: `total_users: 5`

**Bước 2: Xem danh sách users**
```sql
SELECT id, username, email, display_name, is_online 
FROM users 
ORDER BY id;
```

**Kết quả mong đợi**:
```
+----+------------+------------------------+------------------+-----------+
| id | username   | email                  | display_name     | is_online |
+----+------------+------------------------+------------------+-----------+
|  1 | admin      | admin@pverse.com       | Administrator    |         0 |
|  2 | nguyenvana | nguyenvana@example.com | Nguyễn Văn A     |         0 |
|  3 | tranthib   | tranthib@example.com   | Trần Thị B       |         1 |
|  4 | lequangc   | lequangc@example.com   | Lê Quang C       |         0 |
|  5 | phamthid   | phamthid@example.com   | Phạm Thị D       |         1 |
+----+------------+------------------------+------------------+-----------+
```

**Bước 3: Xem settings của users**
```sql
SELECT user_id, theme, language, notifications_enabled 
FROM user_settings 
ORDER BY user_id;
```

**Kết quả mong đợi**:
```
+---------+-------+----------+-----------------------+
| user_id | theme | language | notifications_enabled |
+---------+-------+----------+-----------------------+
|       1 | DARK  | VI       |                     1 |
|       2 | LIGHT | VI       |                     1 |
|       3 | DARK  | EN       |                     0 |
|       4 | LIGHT | EN       |                     1 |
|       5 | AUTO  | VI       |                     1 |
+---------+-------+----------+-----------------------+
```

**Bước 4: Xem tổng hợp (users + settings)**
```sql
SELECT 
    u.id,
    u.username,
    u.display_name,
    u.is_online,
    us.theme,
    us.language,
    us.notifications_enabled
FROM users u
LEFT JOIN user_settings us ON u.id = us.user_id
ORDER BY u.id;
```

**Kết quả mong đợi**: Bảng hiển thị đầy đủ 5 users với settings tương ứng.

---

### 2.6. Thoát khỏi MySQL console

```sql
exit;
```

---

### 2.7. Thông tin đăng nhập Test Users

| ID | Username | Password | Email | Theme | Ngôn ngữ | Online |
|----|----------|----------|-------|-------|----------|--------|
| 1 | **admin** | **admin123** | admin@pverse.com | DARK | VI | ❌ |
| 2 | **nguyenvana** | **password123** | nguyenvana@example.com | LIGHT | VI | ❌ |
| 3 | **tranthib** | **password123** | tranthib@example.com | DARK | EN | ✅ |
| 4 | **lequangc** | **password123** | lequangc@example.com | LIGHT | EN | ❌ |
| 5 | **phamthid** | **password123** | phamthid@example.com | AUTO | VI | ✅ |

✅ **Đã tạo xong 5 test users! Chuyển sang bước 3.**

---

## 🔧 BƯỚC 3: KHỞI ĐỘNG BACKEND

### 3.1. Mở Terminal 1

```cmd
cd D:\04.My_workspace\P-Verse\backend
```

---

### 3.2. Kiểm tra cấu hình

**File**: `src/main/resources/application.properties`

Đảm bảo có các cấu hình sau:
```properties
spring.application.name=P-verse

# MySQL Configuration
spring.datasource.url=jdbc:mysql://localhost:3306/pverse_db?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
spring.datasource.username=pverse_user
spring.datasource.password=123
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

# JPA/Hibernate
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQL8Dialect
spring.jpa.properties.hibernate.format_sql=true
```

---

### 3.3. Compile Backend (Tuỳ chọn - để kiểm tra lỗi)

```cmd
.\mvnw.cmd clean compile
```

**Kết quả mong đợi**:
```
[INFO] BUILD SUCCESS
[INFO] Total time: 4-6 seconds
[INFO] Compiling 36 source files
```

---

### 3.4. Khởi động Spring Boot Application

```cmd
.\mvnw.cmd spring-boot:run
```

**Kết quả mong đợi**:
```
  .   ____          _            __ _ _
 /\\ / ___'_ __ _ _(_)_ __  __ _ \ \ \ \
( ( )\___ | '_ | '_| | '_ \/ _` | \ \ \ \
 \\/  ___)| |_)| | | | | || (_| |  ) ) ) )
  '  |____| .__|_| |_|_| |_\__, | / / / /
 =========|_|==============|___/=/_/_/_/
 :: Spring Boot ::                (v3.x.x)

...
2025-11-08 20:30:00.000  INFO 12345 --- [main] o.s.b.w.embedded.tomcat.TomcatWebServer  : Tomcat started on port(s): 8080 (http)
2025-11-08 20:30:00.000  INFO 12345 --- [main] com.app.pverse.PVerseApplication         : Started PVerseApplication in 5.123 seconds
```

**⚠️ QUAN TRỌNG**: Giữ terminal này mở! Backend đang chạy.

---

### 3.5. Kiểm tra Backend đã chạy chưa

**Mở trình duyệt**: `http://localhost:8080/api/users/1`

**⚠️ LƯU Ý QUAN TRỌNG**:
- API này là **PUBLIC** - không cần đăng nhập
- Trình duyệt sẽ **KHÔNG** hỏi username/password
- Nếu có popup đăng nhập → Backend bị lỗi cấu hình (xem phần xử lý sự cố bên dưới)

**Kết quả mong đợi** (JSON hiển thị ngay):
```json
{
  "id": 1,
  "username": "admin",
  "email": "admin@pverse.com",
  "displayName": "Administrator",
  "bio": "Quản trị viên hệ thống",
  "avatarUrl": null,
  "phoneNumber": null,
  "isOnline": false,
  "lastSeenAt": "2025-11-08T20:00:00",
  "createdAt": "2025-11-08T20:00:00"
}
```

**Nếu thấy JSON như trên**: ✅ **Backend đã sẵn sàng!**

**Nếu trình duyệt hỏi đăng nhập**: ❌ **Xem phần "Sự cố 2 - Triệu chứng 4" bên dưới**

---

## 🎨 BƯỚC 4: KHỞI ĐỘNG FRONTEND

### 4.1. Mở Terminal 2 (Terminal mới)

```cmd
cd D:\04.My_workspace\P-Verse\frontend
```

---

### 4.2. Kiểm tra cấu hình

**File**: `.env.local`

Đảm bảo có:
```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api
```

Nếu file chưa có, tạo file `.env.local` với nội dung trên.

---

### 4.3. Cài đặt dependencies (nếu chưa cài)

```cmd
pnpm install
```

**Kết quả mong đợi**:
```
Packages: +XXX
Progress: resolved XXX, reused XXX, downloaded 0, added XXX, done
```

---

### 4.4. Khởi động Development Server

```cmd
pnpm dev
```

**Kết quả mong đợi**:
```
  ▲ Next.js 14.x.x
  - Local:        http://localhost:3000
  - Network:      http://192.168.x.x:3000

 ✓ Ready in 2.5s
```

**⚠️ QUAN TRỌNG**: Giữ terminal này mở! Frontend đang chạy.

---

### 4.5. Kiểm tra Frontend đã chạy chưa

**Mở trình duyệt**: `http://localhost:3000`

**Kết quả mong đợi**: Trang chủ của P-Verse hiển thị.

✅ **Frontend đã sẵn sàng!**

---

## 🧪 BƯỚC 5: TEST CÁC TÍNH NĂNG

### 5.1. TEST SETTINGS PAGE (Frontend UI)

**Lưu ý**: Có 2 trang settings để test:
- **Trang chính**: `http://localhost:3000/settings` - Giao diện đơn giản, production-ready
- **Trang test**: `http://localhost:3000/settings-test` - Giao diện đầy đủ với công cụ test

---

#### TRANG 1: Settings Page (Production)

**URL**: `http://localhost:3000/settings`

**Đặc điểm**:
- Giao diện đơn giản, sạch sẽ
- Form cơ bản với 3 settings
- Nút "Save Changes" rõ ràng
- Phù hợp cho production

---

#### TRANG 2: Settings Test Page (Testing) ⭐

**URL**: `http://localhost:3000/settings-test`

**Đặc điểm**:
- Giao diện 2 cột
- Bên trái: Form settings + API test buttons
- Bên phải: Current config + Instructions + API endpoints
- Có nút test từng API riêng lẻ
- Console logs chi tiết
- Phù hợp cho testing và debugging

---

### 5.1. TEST SETTINGS PAGE (Frontend UI)

#### Test 5.1.1: Truy cập Settings Page

**Hành động**: Mở trình duyệt và truy cập
```
http://localhost:3000/settings
```

**Kết quả mong đợi**:
- ✅ Trang settings hiển thị
- ✅ Form có dropdown Theme
- ✅ Form có dropdown Language
- ✅ Có nút "Save Changes"
- ✅ Không có lỗi trong Console (F12)

---

#### Test 5.1.2: Thay đổi Theme

**Bước 1**: Mở DevTools (F12) → Tab "Network"

**Bước 2**: Click vào dropdown "Theme"

**Bước 3**: Chọn "Light" (hoặc "Dark" nếu đang là Light)

**Bước 4**: Click nút "Save Changes"

**Kết quả mong đợi**:
- ✅ Nút hiển thị trạng thái loading (vài giây)
- ✅ Xuất hiện thông báo thành công "Settings saved successfully"
- ✅ Trong Network tab: thấy request `PUT /api/users/1/settings` với Status 200
- ✅ Theme được áp dụng (nếu có implement)

**Bước 5**: Refresh trang (F5)

**Kết quả mong đợi**:
- ✅ Theme vừa chọn vẫn được giữ nguyên
- ✅ Dữ liệu đã được lưu vào database

---

#### Test 5.1.3: Thay đổi Language

**Bước 1**: Click vào dropdown "Language"

**Bước 2**: Chọn "English" (hoặc "Tiếng Việt" nếu đang là English)

**Bước 3**: Click nút "Save Changes"

**Kết quả mong đợi**:
- ✅ Thông báo thành công
- ✅ Network request thành công (200 OK)

**Bước 4**: Refresh trang (F5)

**Kết quả mong đợi**:
- ✅ Language vừa chọn vẫn được giữ nguyên

---

#### Test 5.1.4: Thay đổi cả Theme và Language cùng lúc

**Bước 1**: Thay đổi Theme thành "Auto"

**Bước 2**: Thay đổi Language thành "Tiếng Việt"

**Bước 3**: Click "Save Changes"

**Kết quả mong đợi**:
- ✅ Cả hai thay đổi được lưu
- ✅ Chỉ có 1 API request
- ✅ Sau khi refresh, cả hai vẫn giữ nguyên

---

### 5.2. TEST BACKEND API ENDPOINTS

Sử dụng **Browser**, **Postman**, hoặc **curl** để test.

---

#### Test 5.2.1: Get User by ID

**Request**:
```
GET http://localhost:8080/api/users/1
```

**Kết quả mong đợi**:
- **Status**: 200 OK
- **Response**:
```json
{
  "id": 1,
  "username": "admin",
  "email": "admin@pverse.com",
  "displayName": "Administrator",
  "bio": "Quản trị viên hệ thống",
  "avatarUrl": null,
  "phoneNumber": null,
  "isOnline": false,
  "lastSeenAt": "2025-11-08T20:00:00",
  "createdAt": "2025-11-08T20:00:00"
}
```

---

#### Test 5.2.2: Get User by Username

**Request**:
```
GET http://localhost:8080/api/users/username/nguyenvana
```

**Kết quả mong đợi**:
- **Status**: 200 OK
- **Response**: Thông tin user `nguyenvana`

---

#### Test 5.2.3: Get User Settings

**Request**:
```
GET http://localhost:8080/api/users/1/settings
```

**Kết quả mong đợi**:
- **Status**: 200 OK
- **Response**:
```json
{
  "id": 1,
  "userId": 1,
  "theme": "DARK",
  "language": "VI",
  "notificationsEnabled": true,
  "extendedSettings": "{\"emailNotifications\": true, \"pushNotifications\": true, \"privacyLevel\": \"PUBLIC\"}",
  "createdAt": "2025-11-08T20:00:00",
  "updatedAt": "2025-11-08T20:00:00"
}
```

---

#### Test 5.2.4: Update Theme Only

**⚠️ QUAN TRỌNG**: Endpoint này sử dụng **query parameter** (`?theme=LIGHT`)

**Request** (Browser hoặc Postman):
```
PATCH http://localhost:8080/api/users/1/settings/theme?theme=LIGHT
```

**Cách test bằng browser**:
1. Mở Developer Tools (F12) → Console tab
2. Paste và chạy lệnh:
```javascript
fetch('http://localhost:8080/api/users/1/settings/theme?theme=LIGHT', {
  method: 'PATCH'
}).then(r => r.json()).then(console.log)
```

**Kết quả mong đợi**:
- **Status**: 200 OK (Nếu 405 → Xem [Sự cố 5.2](#sự-cố-52-update-apis-trả-về-status-405-method-not-allowed))
- **Response**: Settings với theme = "LIGHT"

**Kiểm tra**: Refresh settings page → Theme hiển thị "Light"

---

#### Test 5.2.5: Update Language Only

**⚠️ QUAN TRỌNG**: Endpoint này sử dụng **query parameter** (`?language=EN`)

**Request**:
```
PATCH http://localhost:8080/api/users/1/settings/language?language=EN
```

**Cách test bằng browser**:
```javascript
fetch('http://localhost:8080/api/users/1/settings/language?language=EN', {
  method: 'PATCH'
}).then(r => r.json()).then(console.log)
```

**Kết quả mong đợi**:
- **Status**: 200 OK
- **Response**: Settings với language = "EN"

**Giá trị hợp lệ**: `EN`, `VI` (case-insensitive: en, vi, EN, VI đều ok)

---

#### Test 5.2.6: Update Notifications Only

**⚠️ QUAN TRỌNG**: Endpoint này sử dụng **query parameter** (`?notificationsEnabled=true`)

**Request**:
```
PATCH http://localhost:8080/api/users/1/settings/notifications?notificationsEnabled=false
```

**Cách test bằng browser**:
```javascript
fetch('http://localhost:8080/api/users/1/settings/notifications?notificationsEnabled=false', {
  method: 'PATCH'
}).then(r => r.json()).then(console.log)
```

**Kết quả mong đợi**:
- **Status**: 200 OK
- **Response**: Settings với notificationsEnabled = false

---

#### Test 5.2.7: Update Full Settings

**⚠️ QUAN TRỌNG**: Endpoint này sử dụng **request body** (JSON)

**Request**:
```
PUT http://localhost:8080/api/users/1/settings
Content-Type: application/json

{
  "theme": "DARK",
  "language": "VI",
  "notificationsEnabled": true,
  "extendedSettings": "{\"emailNotifications\": true}"
}
```

**Cách test bằng browser**:
```javascript
fetch('http://localhost:8080/api/users/1/settings', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    theme: 'DARK',
    language: 'VI',
    notificationsEnabled: true,
    extendedSettings: '{"emailNotifications": true}'
  })
}).then(r => r.json()).then(console.log)
```

**Kết quả mong đợi**:
- **Status**: 200 OK
- **Response**: Settings đã được cập nhật toàn bộ

---

#### Test 5.2.8: Update User Profile

**⚠️ QUAN TRỌNG**: Endpoint này sử dụng **request body** (JSON)

**Request**:
```
PUT http://localhost:8080/api/users/1
Content-Type: application/json

{
  "displayName": "Admin Updated",
  "bio": "Bio đã được cập nhật",
  "phoneNumber": "0999999999"
}
```

**Cách test bằng browser**:
```javascript
fetch('http://localhost:8080/api/users/1', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    displayName: 'Admin Updated',
    bio: 'Bio đã được cập nhật',
    phoneNumber: '0999999999'
  })
}).then(r => r.json()).then(console.log)
```

**Kết quả mong đợi**:
- **Status**: 200 OK
- **Response**: User với thông tin đã cập nhật

---

#### Test 5.2.9: Update Online Status

**⚠️ QUAN TRỌNG**: Endpoint này sử dụng **query parameter** (`?isOnline=true`)

**Request**:
```
PATCH http://localhost:8080/api/users/1/online-status?isOnline=true
```

**Cách test bằng browser**:
```javascript
fetch('http://localhost:8080/api/users/1/online-status?isOnline=true', {
  method: 'PATCH'
}).then(r => r.ok ? 'Success' : 'Failed').then(console.log)
```

**Kết quả mong đợi**:
- **Status**: 200 OK (No Content)
- **Response**: Empty (chỉ status code)

**Kiểm tra Database**:
```sql
SELECT id, username, is_online, last_seen_at FROM users WHERE id = 1;
```
- `is_online` = 1 (true)
- `last_seen_at` đã được cập nhật về thời gian hiện tại

**Test với giá trị false**:
```javascript
fetch('http://localhost:8080/api/users/1/online-status?isOnline=false', {
  method: 'PATCH'
}).then(r => r.ok ? 'User is now offline' : 'Failed').then(console.log)
```

**Kết quả mong đợi**:
- **Status**: 200 OK (No Content)

**Kiểm tra Database**:
```sql
SELECT id, username, is_online, last_seen_at FROM users WHERE id = 1;
```
Kết quả: `is_online` = 1 và `last_seen_at` đã được cập nhật

---

### 5.3. TEST VỚI NHIỀU USER KHÁC NHAU

#### Test 5.3.1: Kiểm tra User 2

**Request**: `GET http://localhost:8080/api/users/2`

**Kết quả mong đợi**: Thông tin user `nguyenvana`

**Request**: `GET http://localhost:8080/api/users/2/settings`

**Kết quả mong đợi**: Settings của user 2 (Theme: LIGHT, Language: VI)

---

#### Test 5.3.2: Cập nhật Settings của User 2

**Request**:
```
PATCH http://localhost:8080/api/users/2/settings/theme?theme=DARK
```

**Kiểm tra**: Settings của User 1 KHÔNG thay đổi (độc lập)

---

### 5.4. KIỂM TRA DATABASE

#### Test 5.4.1: Kết nối Database

```cmd
mysql -u pverse_user -p123 pverse_db
```

---

#### Test 5.4.2: Kiểm tra Users

```sql
SELECT id, username, display_name, is_online, last_seen_at 
FROM users 
ORDER BY id;
```

**Kết quả mong đợi**: 5 users hiển thị với thông tin đầy đủ

---

#### Test 5.4.3: Kiểm tra Settings

```sql
SELECT user_id, theme, language, notifications_enabled 
FROM user_settings 
ORDER BY user_id;
```

**Kết quả mong đợi**: 5 settings tương ứng với 5 users

---

#### Test 5.4.4: Kiểm tra Join Query

```sql
SELECT 
    u.id,
    u.username,
    u.display_name,
    u.is_online,
    us.theme,
    us.language,
    us.notifications_enabled
FROM users u
LEFT JOIN user_settings us ON u.id = us.user_id
ORDER BY u.id;
```

**Kết quả mong đợi**: Tất cả users với settings tương ứng

---

#### Test 5.4.5: Kiểm tra sau khi cập nhật từ API

**Bước 1**: Thay đổi theme trên Settings Page

**Bước 2**: Chạy query
```sql
SELECT user_id, theme, language, updated_at 
FROM user_settings 
WHERE user_id = 1;
```

**Kết quả mong đợi**: 
- Theme đã thay đổi
- `updated_at` đã được cập nhật

---

### 5.5. KIỂM TRA BROWSER DEVTOOLS

#### Test 5.5.1: Kiểm tra Network Requests

**Bước 1**: Mở Settings Page

**Bước 2**: Mở DevTools (F12) → Tab "Network"

**Bước 3**: Thay đổi settings và Save

**Quan sát**:
- ✅ Request URL: `http://localhost:8080/api/users/1/settings`
- ✅ Request Method: PUT
- ✅ Status Code: 200
- ✅ Request Payload: JSON với theme, language
- ✅ Response: Settings đã cập nhật

---

#### Test 5.5.2: Kiểm tra Console Errors

**Bước 1**: Mở DevTools (F12) → Tab "Console"

**Bước 2**: Reload trang và sử dụng các tính năng

**Kết quả mong đợi**:
- ✅ Không có errors màu đỏ
- ✅ Chỉ có warnings hoặc logs bình thường

---

### 5.6. TEST XỬ LÝ LỖI

#### Test 5.6.1: Invalid User ID

**Request**: `GET http://localhost:8080/api/users/999`

**Kết quả mong đợi**:
- **Status**: 404 hoặc 500
- **Error message**: "User không tồn tại" hoặc tương tự

---

#### Test 5.6.2: Invalid Theme Value

**Request**:
```
PATCH http://localhost:8080/api/users/1/settings/theme?theme=INVALID_THEME
```

**Kết quả mong đợi**:
- **Status**: 400 Bad Request
- **Error message**: Invalid theme value

---

## ✅ BẢNG KIỂM TRA TEST (CHECKLIST)

### Frontend Testing
- [ ] Settings page load thành công
- [ ] Có thể thay đổi Theme
- [ ] Có thể thay đổi Language
- [ ] Nút "Save Changes" hoạt động
- [ ] Thông báo thành công hiển thị
- [ ] Settings persist sau khi refresh
- [ ] Không có lỗi trong Console
- [ ] Network requests thành công (200 OK)

### Backend API Testing
- [ ] GET /api/users/{id} - Lấy user theo ID
- [ ] GET /api/users/username/{username} - Lấy user theo username
- [ ] PUT /api/users/{id} - Cập nhật user
- [ ] PATCH /api/users/{id}/online-status - Cập nhật online status
- [ ] GET /api/users/{userId}/settings - Lấy settings
- [ ] PUT /api/users/{userId}/settings - Cập nhật full settings
- [ ] PATCH /api/users/{userId}/settings/theme - Cập nhật theme
- [ ] PATCH /api/users/{userId}/settings/language - Cập nhật language
- [ ] PATCH /api/users/{userId}/settings/notifications - Toggle notifications

### Database Testing
- [ ] 5 users tồn tại trong bảng `users`
- [ ] 5 settings tồn tại trong bảng `user_settings`
- [ ] Mỗi user có settings tương ứng
- [ ] Cập nhật từ API phản ánh trong database
- [ ] `updated_at` được cập nhật khi có thay đổi
- [ ] Settings của các user độc lập với nhau

### Integration Testing
- [ ] Frontend → Backend communication hoạt động
- [ ] Backend → Database persistence hoạt động
- [ ] Thay đổi từ Frontend lưu vào Database
- [ ] Refresh Frontend lấy dữ liệu từ Database
- [ ] Nhiều users có thể có settings khác nhau

---

## 🐛 XỬ LÝ SỰ CỐ

### Sự cố 1: MySQL không khởi động được

**Triệu chứng**: `net start MySQL80` báo lỗi

**Giải pháp**:
```cmd
# Kiểm tra service name
services.msc
# Tìm MySQL service và start thủ công

# Hoặc restart MySQL service
net stop MySQL80
net start MySQL80
```

---

### Sự cố 2: Backend không khởi động được

**Triệu chứng 1**: Port 8080 đã được sử dụng
```
Port 8080 is already in use
```

**Giải pháp**:
```cmd
# Tìm process đang dùng port 8080
netstat -ano | findstr :8080

# Kill process đó
taskkill /PID <PID> /F

# Khởi động lại backend
```

---

**Triệu chứng 2**: Database connection error
```
Unable to connect to database
```

**Giải pháp**:
1. Kiểm tra MySQL đang chạy: `net start | findstr MySQL`
2. Kiểm tra database tồn tại: `mysql -u pverse_user -p123 -e "SHOW DATABASES;"`
3. Kiểm tra credentials trong `application.properties`
4. Test connection: `mysql -u pverse_user -p123 pverse_db`

---

**Triệu chứng 3**: PasswordEncoder bean not found
```
No bean of type PasswordEncoder found
```

**Giải pháp**: Đảm bảo có file `SecurityConfig.java` với:
```java
@Configuration
public class SecurityConfig {
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
```

---

**Triệu chứng 4**: Trình duyệt yêu cầu đăng nhập khi truy cập API
```
Popup đăng nhập xuất hiện với message: "Sign in http://localhost:8080"
```

**Nguyên nhân**: Spring Security đang bật HTTP Basic Authentication

**Giải pháp**:

**Cách 1 - Tắt Security tạm thời** (Khuyến nghị cho testing):

Sửa file `SecurityConfig.java`:
```java
package com.app.pverse.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())  // Tắt CSRF cho testing
            .authorizeHttpRequests(auth -> auth
                .anyRequest().permitAll()  // Cho phép tất cả requests
            );
        return http.build();
    }
}
```

**Cách 2 - Loại bỏ Spring Security dependency** (Nếu không cần):

Sửa file `pom.xml`, comment dòng sau:
```xml
<!-- <dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-security</artifactId>
</dependency> -->
```

Sau đó restart backend:
```cmd
Ctrl+C (stop backend)
.\mvnw.cmd spring-boot:run (start lại)
```

**Kiểm tra lại**: `http://localhost:8080/api/users/1` → Phải hiển thị JSON ngay, không hỏi đăng nhập

**Lưu ý**: Username/password của test users sẽ dùng sau khi implement Authentication module

---

### Sự cố 7: Lỗi 500 khi load Settings Page

**Triệu chứng**:
```
Console (F12) hiển thị:
- GET http://localhost:8080/api/users/1/settings 500 (Internal Server Error)
- Failed to load settings: Error: Failed to fetch settings
```

**Nguyên nhân**: 
- User settings chưa tồn tại trong database
- Backend throw exception khi không tìm thấy settings

**Giải pháp đã áp dụng**:
- ✅ Code đã được sửa để tự động tạo settings nếu chưa có
- ✅ Khi user lần đầu truy cập settings page, backend tự động tạo settings mặc định

**Hành động**:

**Bước 1**: Restart backend
```cmd
Ctrl+C (stop backend)
cd D:\04.My_workspace\P-Verse\backend
.\mvnw.cmd clean compile
.\mvnw.cmd spring-boot:run
```

**Bước 2**: Test lại
```
http://localhost:3000/settings
```

**Kết quả mong đợi**:
- ✅ Không có lỗi trong Console
- ✅ Settings page load thành công
- ✅ Settings được tạo tự động với giá trị mặc định (LIGHT theme, VI language)

**Kiểm tra database** (nếu muốn):
```sql
mysql -u pverse_user -p123 pverse_db
SELECT * FROM user_settings WHERE user_id = 1;
```
→ Settings đã được tạo tự động

**Chi tiết**: Xem file `ERROR_500_EXPLANATION.md` để hiểu rõ nguyên nhân và cách sửa

---

### Sự cố 3: Frontend không khởi động được

**Triệu chứng 1**: Port 3000 đã được sử dụng

**Giải pháp**:
```cmd
# Kill process trên port 3000
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Hoặc sử dụng port khác
pnpm dev -- -p 3001
```

---

**Triệu chứng 2**: pnpm not found

**Giải pháp**:
```cmd
# Cài đặt pnpm
npm install -g pnpm

# Hoặc dùng npm thay thế
npm run dev
```

---

### Sự cố 4: Settings không lưu được

**Triệu chứng**: Click "Save" nhưng không thấy thay đổi

**Giải pháp**:
1. Kiểm tra Network tab (F12) → có request không?
2. Kiểm tra status code → 200 OK?
3. Kiểm tra backend logs → có lỗi không?
4. Kiểm tra database → dữ liệu có thay đổi không?
5. Kiểm tra `.env.local` → API URL đúng chưa?

---

### Sự cố 5: CORS Error

**Triệu chứng**:
```
Access to fetch at 'http://localhost:8080/api/...' from origin 'http://localhost:3000' has been blocked by CORS policy
```

**Giải pháp**: Đảm bảo có `CorsConfig.java`:
```java
@Configuration
public class CorsConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins("http://localhost:3000")
                .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true);
    }
}
```

Sau đó restart backend.

---

### Sự cố 5.1: API Test buttons trả về status 400

**Triệu chứng**:
- Tất cả các nút "Test Theme API", "Test Language API", "Test Notifications API" đều failed
- Console hiển thị lỗi status 400 (Bad Request)
- Backend nhận được request nhưng không parse được dữ liệu

**Nguyên nhân**: 
Frontend gửi dữ liệu qua **query parameters** (`?theme=LIGHT`) nhưng backend đang dùng `@RequestBody` để nhận dữ liệu từ request body.

**Giải pháp đã áp dụng**:
Đã sửa file `frontend/app/services/settingsService.ts` để gửi dữ liệu qua **request body** thay vì query parameters:

```typescript
// ✅ ĐÚNG - Gửi qua request body
updateTheme: async (userId: number, theme: string) => {
    const res = await fetch(`${API_URL}/users/${userId}/settings/theme`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme })  // ← Gửi trong body
    });
    if (!res.ok) throw new Error('Failed to update theme');
    return res.json();
}

// ❌ SAI - Gửi qua query parameter
updateTheme: async (userId: number, theme: string) => {
    const res = await fetch(`${API_URL}/users/${userId}/settings/theme?theme=${theme}`, {
        method: 'PATCH',
    });
    // ...
}
```

**Cách kiểm tra đã fix**:
1. Refresh trang `http://localhost:3000/settings-test`
2. Click vào các nút "Test Theme API", "Test Language API", "Test Notifications API"
3. Kiểm tra console (F12) - không còn lỗi 400
4. Kiểm tra toast notification hiển thị "Theme/Language/Notifications API Test" thành công

**Lưu ý**: Không cần restart backend vì chỉ sửa frontend.

---

### Sự cố 5.2: Update APIs trả về status 405 (Method Not Allowed)

**Triệu chứng**:
- Khi test các endpoint PATCH trong phần "TEST BACKEND API ENDPOINTS":
  - `PATCH /api/users/{id}/settings/theme?theme=LIGHT` → **405 Method Not Allowed**
  - `PATCH /api/users/{id}/settings/language?language=EN` → **405 Method Not Allowed**
  - `PATCH /api/users/{id}/settings/notifications?notificationsEnabled=true` → **405 Method Not Allowed**
  - `PATCH /api/users/{id}/online-status?isOnline=true` → **405 Method Not Allowed**
- Network tab hiển thị status 405
- Backend không nhận được request hoặc không map được endpoint
- **⚠️ QUAN TRỌNG**: Gõ trực tiếp URL vào browser address bar sẽ bị lỗi 405 vì browser gửi **GET request**, không phải PATCH!

**Nguyên nhân có 2 trường hợp**: 

**Nguyên nhân 1 (ĐÃ FIX)**: Mismatch giữa query params và request body
- Controller endpoints đang được config để nhận dữ liệu từ **request body** (`@RequestBody`), nhưng trong TESTING_WORKFLOW.md các test case lại dùng **query parameters** (`?theme=LIGHT`, `?language=EN`).
- Spring Boot không thể map request với query params vào endpoint yêu cầu request body → Trả về lỗi **405 Method Not Allowed**.
- ✅ **ĐÃ FIX**: Đổi từ `@RequestBody` sang `@RequestParam`

**Nguyên nhân 2 (QUAN TRỌNG)**: Gõ URL trực tiếp vào browser
- Khi bạn **gõ URL vào browser address bar** (ví dụ: `http://localhost:8080/api/users/1/settings/theme?theme=LIGHT`), trình duyệt tự động gửi **GET request**
- Nhưng endpoint yêu cầu **PATCH request** (`@PatchMapping`)
- GET ≠ PATCH → Spring Boot không tìm thấy endpoint phù hợp → Trả về **405 Method Not Allowed**
- ⚠️ **GIẢI PHÁP**: KHÔNG test PATCH/PUT/POST endpoints bằng cách gõ URL trực tiếp vào browser!
- ✅ **CÁCH ĐÚNG**: Dùng Console với `fetch()`, Postman, hoặc curl

**Giải pháp đã áp dụng**:
Đã sửa các controller để nhận **query parameters** (`@RequestParam`) thay vì request body, phù hợp với cách test đơn giản hơn:

**File `UserSettingsController.java`**:
```java
// ✅ ĐÚNG - Nhận query parameter
@PatchMapping("/{userId}/settings/theme")
public ResponseEntity<UserSettingsDto> updateTheme(
        @PathVariable Long userId,
        @RequestParam String theme) {  // ← Dùng @RequestParam
    UpdateSettingsRequest request = new UpdateSettingsRequest();
    request.setTheme(UserSettings.Theme.valueOf(theme.toUpperCase()));
    return ResponseEntity.ok(settingsService.updateSettings(userId, request));
}

// ❌ SAI - Nhận request body
@PatchMapping("/{userId}/settings/theme")
public ResponseEntity<UserSettingsDto> updateTheme(
        @PathVariable Long userId,
        @RequestBody UpdateSettingsRequest request) {  // ← Dùng @RequestBody
    return ResponseEntity.ok(settingsService.updateSettings(userId, request));
}
```

**Tương tự cho các endpoints**:
- `updateLanguage`: `@RequestParam String language`
- `toggleNotifications`: `@RequestParam Boolean notificationsEnabled`
- `updateOnlineStatus` (trong `UserController.java`): `@RequestParam Boolean isOnline`

**Cách kiểm tra đã fix**:

**⚠️ LƯU Ý CỰC KỲ QUAN TRỌNG**:
- ❌ **KHÔNG** gõ URL trực tiếp vào browser address bar!
- ❌ Ví dụ SAI: Gõ `http://localhost:8080/api/users/1/settings/theme?theme=LIGHT` vào thanh địa chỉ → Sẽ bị 405!
- ✅ **PHẢI** dùng Console với `fetch()`, hoặc Postman, hoặc curl
- **Lý do**: Browser gửi GET request khi gõ URL, nhưng endpoint cần PATCH request

**Bước 1**: **Restart backend** (BẮT BUỘC)
```cmd
Ctrl+C  (trong terminal đang chạy backend)
cd D:\04.My_workspace\P-Verse\backend
.\mvnw.cmd spring-boot:run
```

**Bước 2**: Test bằng **Browser Console** (CÁCH ĐÚNG)

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
fetch('http://localhost:8080/api/users/1/settings/notifications?notificationsEnabled=true', {
  method: 'PATCH'
}).then(r => r.json()).then(console.log)

// Test 4: Update online status
fetch('http://localhost:8080/api/users/1/online-status?isOnline=true', {
  method: 'PATCH'
}).then(r => r.ok ? 'Success' : 'Failed').then(console.log)
```

**Kết quả mong đợi**:
- ✅ Status code: **200 OK** (không còn 405)
- ✅ Console hiển thị JSON response với dữ liệu đã cập nhật
- ✅ Không có lỗi trong Console

**Bước 3**: Test lại trên frontend `http://localhost:3000/settings-test`
- Click "Test Theme API" → ✅ Success
- Click "Test Language API" → ✅ Success
- Click "Test Notifications API" → ✅ Success

**Lưu ý quan trọng**:
- ⚠️ **PHẢI restart backend** sau khi sửa controller
- Frontend không cần restart (vì không thay đổi)
- Phương pháp này đơn giản hơn cho testing, phù hợp với RESTful API cho partial updates
- ❌ **TUYỆT ĐỐI KHÔNG** gõ URL trực tiếp vào browser address bar để test PATCH/PUT/POST endpoints!

---

### Sự cố 6: Test data không insert được

**Triệu chứng**: Chạy SQL nhưng không thấy dữ liệu

**Giải pháp**:
```sql
-- Kiểm tra đang ở database nào
SELECT DATABASE();

-- Chuyển sang database đúng
USE pverse_db;

-- Xóa dữ liệu cũ và chạy lại INSERT
DELETE FROM user_settings;
DELETE FROM users;

-- Copy và paste lại các câu lệnh INSERT từ Bước 2.3 và 2.4

-- Kiểm tra
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM user_settings;
```

---

## 📚 THAM KHẢO NHANH

### Thông tin đăng nhập Test Users

```
┌────┬─────────────┬──────────────┬───────┬──────────┐
│ ID │  Username   │   Password   │ Theme │ Language │
├────┼─────────────┼──────────────┼───────┼──────────┤
│ 1  │ admin       │ admin123     │ DARK  │ VI       │
│ 2  │ nguyenvana  │ password123  │ LIGHT │ VI       │
│ 3  │ tranthib    │ password123  │ DARK  │ EN       │
│ 4  │ lequangc    │ password123  │ LIGHT │ EN       │
│ 5  │ phamthid    │ password123  │ AUTO  │ VI       │
└────┴─────────────┴──────────────┴───────┴──────────┘
```

---

### Danh sách API Endpoints

```
┌──────┬──────────────────────────────────────────────────┬─────────────────────┐
│ HTTP │                    Endpoint                       │     Chức năng       │
├──────┼──────────────────────────────────────────────────┼─────────────────────┤
│ GET  │ /api/users/me                                    │ Lấy user hiện tại   │
│ GET  │ /api/users/{id}                                  │ Lấy user theo ID    │
│ GET  │ /api/users/username/{username}                   │ Lấy user theo username│
│ PUT  │ /api/users/{id}                                  │ Cập nhật user       │
│ PATCH│ /api/users/{id}/online-status?isOnline={bool}   │ Cập nhật online     │
│ PUT  │ /api/users/profile                               │ Cập nhật profile    │
│ PUT  │ /api/users/password                              │ Đổi mật khẩu        │
├──────┼──────────────────────────────────────────────────┼─────────────────────┤
│ GET  │ /api/users/{userId}/settings                     │ Lấy settings        │
│ PUT  │ /api/users/{userId}/settings                     │ Cập nhật settings   │
│ PATCH│ /api/users/{userId}/settings/theme?theme={value} │ Cập nhật theme      │
│ PATCH│ /api/users/{userId}/settings/language?language={value}│ Cập nhật language│
│ PATCH│ /api/users/{userId}/settings/notifications?enabled={bool}│ Toggle notifications│
└──────┴──────────────────────────────────────────────────┴─────────────────────┘
```

---

### Các URL quan trọng

```
┌─────────────────────┬────────────────────────────────────────┐
│      Service        │                 URL                    │
├─────────────────────┼────────────────────────────────────────┤
│ Frontend Homepage   │ http://localhost:3000                  │
│ Settings Page       │ http://localhost:3000/settings         │
├─────────────────────┼────────────────────────────────────────┤
│ Backend API (User)  │ http://localhost:8080/api/users/1      │
│ Backend API (Settings)│ http://localhost:8080/api/users/1/settings│
└─────────────────────┴────────────────────────────────────────┘
```

---

### Các lệnh thường dùng

```bash
# MySQL
mysql -u pverse_user -p123 pverse_db                    # Kết nối database
mysql -u pverse_user -p123 -e "SELECT * FROM users;"    # Chạy query nhanh

# Backend
cd D:\04.My_workspace\P-Verse\backend
.\mvnw.cmd clean compile                                # Compile
.\mvnw.cmd spring-boot:run                              # Run backend

# Frontend
cd D:\04.My_workspace\P-Verse\frontend
pnpm install                                            # Cài dependencies
pnpm dev                                                # Run frontend

# Kiểm tra ports
netstat -ano | findstr :3306                            # MySQL port
netstat -ano | findstr :8080                            # Backend port
netstat -ano | findstr :3000                            # Frontend port

# Kill process
taskkill /PID <PID> /F                                  # Kill process theo PID
```

---

### Queries SQL hữu ích

```sql
-- Xem tất cả users
SELECT * FROM users;

-- Xem tất cả settings
SELECT * FROM user_settings;

-- Xem users với settings
SELECT u.username, us.theme, us.language 
FROM users u 
JOIN user_settings us ON u.id = us.user_id;

-- Cập nhật theme cho user
UPDATE user_settings SET theme = 'DARK' WHERE user_id = 1;

-- Reset test data
DELETE FROM user_settings;
DELETE FROM users;
```

---

## 🎯 KẾT LUẬN

### Bạn đã test thành công khi:

- ✅ **Backend khởi động** không có lỗi
- ✅ **Frontend khởi động** không có lỗi  
- ✅ **Database có 5 test users** với settings tương ứng
- ✅ **Settings page load** thành công
- ✅ **Thay đổi theme** và lưu được
- ✅ **Thay đổi language** và lưu được
- ✅ **Settings persist** sau khi refresh
- ✅ **API endpoints** trả về dữ liệu đúng
- ✅ **Database cập nhật** khi có thay đổi
- ✅ **Nhiều users** có settings độc lập

### Các tính năng đã được test:

1. ✅ User Management (CRUD operations)
2. ✅ User Settings Management
3. ✅ Theme switching (LIGHT/DARK/AUTO)
4. ✅ Language switching (EN/VI)
5. ✅ Settings persistence
6. ✅ API integration
7. ✅ Database relationships
8. ✅ Multiple users support

---

## 🚀 BƯỚC TIẾP THEO

Sau khi test thành công, bạn có thể:

### Ngắn hạn
- [ ] Document các issues tìm thấy (nếu có)
- [ ] Thêm test cases chi tiết hơn
- [ ] Optimize performance

### Dài hạn
- [ ] Implement Authentication (Login/Logout)
- [ ] Implement Authorization (JWT)
- [ ] Thêm User Profile Page
- [ ] Thêm User Registration UI
- [ ] Upload avatar functionality
- [ ] Email verification
- [ ] Friend management
- [ ] Notifications system

---

## 📞 HỖ TRỢ

Nếu gặp vấn đề không có trong tài liệu này:

1. **Kiểm tra logs**:
   - Backend: Terminal đang chạy `mvnw spring-boot:run`
   - Frontend: Terminal đang chạy `pnpm dev`
   - Browser: Console (F12) và Network tab

2. **Kiểm tra database**:
   ```sql
   mysql -u pverse_user -p123 pverse_db
   SHOW TABLES;
   SELECT * FROM users;
   SELECT * FROM user_settings;
   ```

3. **Restart tất cả**:
   - Stop backend (Ctrl+C)
   - Stop frontend (Ctrl+C)
   - Restart MySQL
   - Start lại backend
   - Start lại frontend

---

## ❓ CÂU HỎI THƯỜNG GẶP (FAQ)

### Q1: Tại sao không cần đăng nhập để truy cập API?

**Trả lời**: 
- Hệ thống hiện tại **chưa có Authentication module**
- Tất cả API endpoints đang **public** (ai cũng truy cập được)
- Username/password trong database chỉ là dữ liệu test, chưa dùng để đăng nhập
- Authentication sẽ được implement trong giai đoạn sau

### Q2: Khi nào sử dụng username/password của test users?

**Trả lời**:
- Username/password (admin/admin123, nguyenvana/password123...) sẽ dùng **sau này**
- Khi implement **Login/Logout** feature
- Khi có **JWT Authentication**
- Khi có **User Session Management**
- Hiện tại chỉ dùng để test CRUD operations trong database

### Q3: Trình duyệt yêu cầu đăng nhập khi truy cập API?

**Trả lời**:
- Đó là lỗi cấu hình Spring Security
- API đang bị bảo vệ bởi HTTP Basic Authentication
- Xem **"Sự cố 2 - Triệu chứng 4"** để fix
- Sau khi fix, API sẽ trả về JSON ngay mà không hỏi đăng nhập

### Q4: Làm sao để test tính năng Login?

**Trả lời**:
- Tính năng Login **chưa được implement**
- Module hiện tại chỉ test: User Management & Settings
- Để có Login, cần implement thêm:
  - AuthController với endpoint `/api/auth/login`
  - JWT token generation
  - Session management
  - Protected routes

### Q5: Dữ liệu test users có ý nghĩa gì?

**Trả lời**:
- **Hiện tại**: Chỉ để test CRUD operations (tạo, đọc, cập nhật user)
- **Tương lai**: Sẽ dùng để test Login/Logout
- Password đã được mã hóa BCrypt sẵn để chuẩn bị cho Authentication module
- Có thể dùng API để cập nhật thông tin user, settings

### Q6: Tại sao gõ URL vào browser bị lỗi 405 nhưng dùng Console lại được?

**Trả lời**:
- **Nguyên nhân**: Khi gõ URL vào browser address bar, trình duyệt tự động gửi **GET request**
- Nhưng các endpoint update (theme, language, notifications...) yêu cầu **PATCH request**
- GET ≠ PATCH → Server trả về **405 Method Not Allowed**

**Ví dụ**:
```
❌ SAI: Gõ http://localhost:8080/api/users/1/settings/theme?theme=LIGHT vào address bar
→ Browser gửi: GET /api/users/1/settings/theme?theme=LIGHT
→ Endpoint cần: PATCH /api/users/1/settings/theme?theme=LIGHT
→ Kết quả: 405 Method Not Allowed ❌

✅ ĐÚNG: Dùng Console với fetch()
fetch('http://localhost:8080/api/users/1/settings/theme?theme=LIGHT', {
  method: 'PATCH'  // ← Chỉ định đúng HTTP method
})
→ Browser gửi: PATCH /api/users/1/settings/theme?theme=LIGHT
→ Kết quả: 200 OK ✅
```

**Cách test đúng**:
- ✅ Dùng **Browser Console** với `fetch()` và chỉ định `method: 'PATCH'`
- ✅ Dùng **Postman** (chọn method = PATCH)
- ✅ Dùng **curl**: `curl -X PATCH "http://localhost:8080/api/users/1/settings/theme?theme=LIGHT"`
- ❌ **KHÔNG** gõ trực tiếp URL vào address bar!

**Các HTTP methods**:
- **GET**: Lấy dữ liệu (gõ URL vào browser = GET)
- **POST**: Tạo mới (phải dùng form hoặc fetch)
- **PUT**: Cập nhật toàn bộ (phải dùng fetch)
- **PATCH**: Cập nhật một phần (phải dùng fetch)
- **DELETE**: Xóa (phải dùng fetch)

**Lưu ý**: Chỉ có **GET request** mới có thể test bằng cách gõ URL trực tiếp vào browser!

---

**Chúc bạn test thành công! 🎉**

---

**Tài liệu này bao gồm mọi thứ bạn cần để test User Management Module từ đầu đến cuối.**

