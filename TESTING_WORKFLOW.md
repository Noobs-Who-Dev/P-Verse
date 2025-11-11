# 🚀 WORKFLOW HOÀN CHỈNH - USER MANAGEMENT TESTING

**Dự án**: P-Verse  
**Module**: User Management & Settings  
**Ngày**: 8 tháng 11, 2025  
**Trạng thái**: ✅ SẴN SÀNG TEST

---

## 📋 MỤC LỤC

1. [Tổng quan](#tổng-quan)
2. [Yêu cầu hệ thống](#yêu-cầu-hệ-thống)
3. [Bước 1: Cài đặt Database](#bước-1-cài-đặt-database)
4. [Bước 2: Tạo người dùng test](#bước-2-tạo-người-dùng-test)
5. [Bước 3: Khởi động Backend](#bước-3-khởi-động-backend)
6. [Bước 4: Khởi động Frontend](#bước-4-khởi-động-frontend)
7. [Bước 5: Test các tính năng](#bước-5-test-các-tính-năng)
8. [Xử lý sự cố](#xử-lý-sự-cố)
9. [Tham khảo nhanh](#tham-khảo-nhanh)

---

## 🎯 TỔNG QUAN

### Mục tiêu
Test đầy đủ các tính năng User Management và Settings của hệ thống P-Verse.

### Các tính năng sẽ test
- ✅ Quản lý thông tin người dùng (User Management)
- ✅ Cài đặt người dùng (User Settings)
- ✅ Thay đổi theme (LIGHT/DARK/AUTO)
- ✅ Thay đổi ngôn ngữ (EN/VI)
- ✅ Lưu và phục hồi cài đặt
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
# Kiểm tra tất cả
mysql --version
java -version
node --version
pnpm --version
```

### Cổng (Ports) cần thiết
- **MySQL**: 3306
- **Backend**: 8080
- **Frontend**: 3000

### Kiểm tra ports có đang sử dụng không
```cmd
netstat -ano | findstr :3306
netstat -ano | findstr :8080
netstat -ano | findstr :3000
```

---

## 🗄️ BƯỚC 1: CÀI ĐẶT DATABASE

### 1.1. Khởi động MySQL Server

```cmd
# Kiểm tra MySQL đang chạy
net start | findstr MySQL

# Nếu chưa chạy, khởi động MySQL
net start MySQL80
```

**Kết quả mong đợi**: "The MySQL80 service is starting..." hoặc "The requested service has already been started."

**⚠️ Lưu ý:** Nếu gặp lỗi, xem thêm tại [START_BACKEND_GUIDE.md](START_BACKEND_GUIDE.md)

---

### 1.2. Tạo Database và User

**Bước 1**: Kết nối vào MySQL với quyền root
```cmd
mysql -u root -p
```
*(Nhập password của root)*

**Bước 2**: Chạy các lệnh SQL sau
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

**Kết quả mong đợi**:
```
Database created: pverse_db
User created: pverse_user@localhost
Privileges granted successfully
```

---

### 1.3. Kiểm tra kết nối

```cmd
mysql -u pverse_user -p123 -e "SELECT 'Connection successful!' AS Status;"
```

**Kết quả mong đợi**:
```
+----------------------+
| Status               |
+----------------------+
| Connection successful!|
+----------------------+
```

---

## 👥 BƯỚC 2: TẠO NGƯỜI DÙNG TEST

### 2.1. Kết nối vào Database

```cmd
mysql -u pverse_user -p123 pverse_db
```

**Kết quả mong đợi**: Đăng nhập thành công vào database `pverse_db`

---

### 2.2. Xóa dữ liệu cũ (nếu có)

```sql
-- Xóa settings trước (vì có foreign key)
DELETE FROM user_settings WHERE user_id IN (1,2,3,4,5);

-- Xóa users
DELETE FROM users WHERE id IN (1,2,3,4,5);
```

**Lưu ý**: Mật khẩu đã được mã hóa bằng BCrypt:
- `admin123` → `$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy`
- `password123` → `$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy`

---

### 2.3. Tạo 5 Test Users

**Copy và paste đoạn SQL sau vào MySQL console:**

```sql
-- Tạo 5 người dùng test
INSERT INTO users (username, email, password, display_name, bio, avatar_url, phone_number, is_online, last_seen_at, created_at, updated_at) VALUES
('admin', 'admin@pverse.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Administrator', 'Quản trị viên hệ thống', NULL, NULL, false, NOW(), NOW(), NOW()),
('nguyenvana', 'nguyenvana@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Nguyễn Văn A', 'Developer từ Hà Nội', 'https://i.pravatar.cc/150?img=1', '0901234567', false, NOW(), NOW(), NOW()),
('tranthib', 'tranthib@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Trần Thị B', 'Designer & Nghệ sĩ', 'https://i.pravatar.cc/150?img=2', '0902345678', true, NOW(), NOW(), NOW()),
('lequangc', 'lequangc@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Lê Quang C', 'Kỹ sư phần mềm', 'https://i.pravatar.cc/150?img=3', '0903456789', false, NOW(), NOW(), NOW()),
('phamthid', 'phamthid@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Phạm Thị D', 'Sinh viên & Nhiếp ảnh gia', 'https://i.pravatar.cc/150?img=4', NULL, true, NOW(), NOW(), NOW());
```

**Kết quả mong đợi**:
```
Query OK, 5 rows affected (0.01 sec)
Records: 5  Duplicates: 0  Warnings: 0
```

---

### 2.4. Tạo User Settings cho từng user

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

**Request**:
```
PATCH http://localhost:8080/api/users/1/settings/theme?theme=LIGHT
```

**Kết quả mong đợi**:
- **Status**: 200 OK
- **Response**: Settings với theme = "LIGHT"

**Kiểm tra**: Refresh settings page → Theme hiển thị "Light"

---

#### Test 5.2.5: Update Language Only

**Request**:
```
PATCH http://localhost:8080/api/users/1/settings/language?language=EN
```

**Kết quả mong đợi**:
- **Status**: 200 OK
- **Response**: Settings với language = "EN"

---

#### Test 5.2.6: Update Full Settings

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

**Kết quả mong đợi**:
- **Status**: 200 OK
- **Response**: Settings đã được cập nhật

---

#### Test 5.2.7: Update User Profile

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

**Kết quả mong đợi**:
- **Status**: 200 OK
- **Response**: User với thông tin đã cập nhật

---

#### Test 5.2.8: Update Online Status

**Request**:
```
PATCH http://localhost:8080/api/users/1/online-status?isOnline=true
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

### 5.7. TEST AUTHENTICATION & LOGOUT

#### Test 5.7.1: Đăng nhập với Test User

**Bước 1**: Mở trang đăng nhập
```
http://localhost:3000/login
```

**Bước 2**: Điền thông tin đăng nhập
- **Username**: `admin`
- **Password**: `admin123`

**Bước 3**: Click nút "Login"

**Kết quả mong đợi**:
- ✅ Redirect đến trang chủ (`/`)
- ✅ Header hiển thị: "Welcome, Administrator"
- ✅ Có nút "Logout" trong header

---

#### Test 5.7.2: Kiểm tra trạng thái đăng nhập

**Bước 1**: Sau khi đăng nhập thành công, kiểm tra:

**Console (F12)**:
```javascript
// Check localStorage
localStorage.getItem('token')      // Phải có giá trị
localStorage.getItem('user')       // Phải có JSON object

// Check cookie
document.cookie                    // Phải có 'auth-token=...'
```

**Kết quả mong đợi**:
- ✅ Token được lưu trong localStorage
- ✅ User info được lưu trong localStorage
- ✅ Auth token được lưu trong cookie

---

#### Test 5.7.3: Logout bằng Header Button

**Bước 1**: Click vào nút "Logout" ở Header (góc phải màn hình)

**Kết quả mong đợi**:
- ✅ Redirect về trang `/login`
- ✅ Token bị xóa khỏi localStorage
- ✅ User info bị xóa khỏi localStorage
- ✅ Cookie `auth-token` bị xóa
- ✅ Không thể truy cập `/settings` nữa (redirect về `/login`)

**Kiểm tra trong Console**:
```javascript
localStorage.getItem('token')      // null
localStorage.getItem('user')       // null
document.cookie                    // Không có 'auth-token'
```

---

#### Test 5.7.4: Logout bằng Sidebar Menu

**Bước 1**: Đăng nhập lại với user `admin`

**Bước 2**: Click vào nút "More" ở cuối Sidebar (góc dưới bên trái)

**Bước 3**: Trong dropdown menu, click vào "Log out"

**Kết quả mong đợi**:
- ✅ Redirect về trang `/login`
- ✅ Token và user info bị xóa
- ✅ Cookie bị xóa
- ✅ Không còn trạng thái authenticated

---

#### Test 5.7.5: Test Protected Routes

**Bước 1**: Đăng xuất (nếu đang đăng nhập)

**Bước 2**: Thử truy cập các trang protected:
```
http://localhost:3000/settings
http://localhost:3000/profile
http://localhost:3000/messages
```

**Kết quả mong đợi**:
- ✅ Tất cả đều redirect về `/login`
- ✅ Hiển thị message "Redirecting to login..."

---

#### Test 5.7.6: Test Multiple Users

**Test với User 1** (`admin`):
1. Login với `admin` / `admin123`
2. Vào `/settings` → Thấy theme = DARK, language = VI
3. Logout

**Test với User 2** (`nguyenvana`):
1. Login với `nguyenvana` / `password123`
2. Vào `/settings` → Thấy theme = LIGHT, language = VI
3. Logout

**Kết quả mong đợi**:
- ✅ Mỗi user có settings riêng
- ✅ Logout của user này không ảnh hưởng user khác
- ✅ Settings không bị lẫn lộn giữa các users

---

#### Test 5.7.7: Refresh Page khi đã đăng nhập

**Bước 1**: Đăng nhập với user `admin`

**Bước 2**: Refresh page (F5 hoặc Ctrl+R)

**Kết quả mong đợi**:
- ✅ Vẫn giữ trạng thái đăng nhập
- ✅ Không bị redirect về `/login`
- ✅ Header vẫn hiển thị "Welcome, Administrator"
- ✅ Settings vẫn load đúng

---

#### Test 5.7.8: Open New Tab khi đã đăng nhập

**Bước 1**: Đăng nhập ở Tab 1

**Bước 2**: Mở Tab 2 và truy cập `http://localhost:3000`

**Kết quả mong đợi**:
- ✅ Tab 2 tự động authenticated (không cần đăng nhập lại)
- ✅ Header hiển thị user info
- ✅ Có thể truy cập `/settings`

---

#### Test 5.7.9: Logout ở một Tab

**Bước 1**: Đăng nhập và mở 2 tabs

**Bước 2**: Logout ở Tab 1

**Bước 3**: Chuyển sang Tab 2 và refresh

**Kết quả mong đợi**:
- ✅ Tab 2 cũng bị logout
- ✅ Redirect về `/login` khi refresh Tab 2
- ✅ LocalStorage đã bị xóa ở cả 2 tabs

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

### Authentication & Logout Testing
- [ ] Trang login hiển thị đúng
- [ ] Đăng nhập thành công với test user
- [ ] Redirect về trang chủ sau login
- [ ] Header hiển thị tên user và nút Logout
- [ ] Token và user info được lưu trong localStorage
- [ ] Auth cookie được tạo
- [ ] Logout từ Header button hoạt động
- [ ] Logout từ Sidebar menu hoạt động
- [ ] Token/user info bị xóa sau logout
- [ ] Redirect về login sau logout
- [ ] Protected routes redirect về login khi chưa authenticated
- [ ] Refresh page giữ trạng thái đăng nhập
- [ ] Multiple tabs share authentication state
- [ ] Mỗi user có settings riêng biệt

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

**Lưu ý**: Username/password của test users (admin/admin123) sẽ dùng sau khi implement Authentication module

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

---

**Chúc bạn test thành công! 🎉**

---

**Tài liệu này bao gồm mọi thứ bạn cần để test User Management Module từ đầu đến cuối.**


