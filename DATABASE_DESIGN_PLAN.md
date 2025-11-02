# KẾ HOẠCH THIẾT KẾ DATABASE - P-VERSE
## 🎓 DỰ ÁN BÀI TẬP LỚN - SINH VIÊN NĂM 3 - JAVA DESKTOP APP

## Tổng Quan Dự Án
**P-Verse** là một ứng dụng **Java Desktop Application** LOCAL kết nối nhóm bạn thân qua "khoảnh khắc số" tức thì, biến màn hình máy tính thành cửa sổ nhìn vào thế giới số của nhau.

**Phạm vi**: Ứng dụng mạng xã hội LOCAL, tập trung vào tính năng CORE, phù hợp cho dự án bài tập lớn 4 sinh viên.

**Công nghệ**: Java 17 + Spring Boot 3.x (embedded backend) + JavaFX (UI) + H2/MySQL Database

---

## I. PHÂN TÍCH YÊU CẦU - PHIÊN BẢN ĐƠN GIẢN

### 1. Tính Năng CORE (Bắt buộc triển khai)
- ✅ **User Management**: Đăng ký, đăng nhập cơ bản
- ✅ **Moments/Posts**: Chia sẻ screenshot với caption
- ✅ **Smart Context**: Tự động nhận diện app đang dùng (Spotify, Game, Browser)
- ✅ **Social Network**: Kết bạn, xem feed bạn bè
- ✅ **Reactions**: Like/Love/Haha... trên moments
- ✅ **Comments**: Bình luận trên moments
- ✅ **Messaging**: Chat 1-1 cơ bản
- ✅ **Join In**: Yêu cầu tham gia hoạt động của bạn

### 2. Tính Năng LOẠI BỎ (Không cần thiết cho bài tập lớn)
- ❌ Two-Factor Authentication (2FA)
- ❌ Email/Phone verification
- ❌ Multiple device management
- ❌ Sticker packs (giữ emoji đơn giản)
- ❌ Group chat (chỉ 1-1)
- ❌ Activity history analytics
- ❌ Friend suggestions algorithm
- ❌ Advanced privacy controls
- ❌ Voice messages
- ❌ Message reactions

---

## II. LỰA CHỌN DATABASE CHO JAVA DESKTOP APP

### 🎯 Khuyến nghị cho Bài Tập Lớn

#### **Option 1: H2 Database (KHUYẾN NGHỊ MẠNH)**
```properties
# application.properties
spring.datasource.url=jdbc:h2:file:./data/pverse-db
spring.datasource.driverClassName=org.h2.Driver
spring.jpa.database-platform=org.hibernate.dialect.H2Dialect
spring.h2.console.enabled=true
```

**Ưu điểm:**
- ✅ **Embedded database** - không cần cài đặt server riêng
- ✅ **File-based** - data lưu trong file `./data/pverse-db.mv.db`
- ✅ **Zero configuration** - chỉ cần thêm dependency vào pom.xml
- ✅ **H2 Console** - có web UI để xem data (http://localhost:8080/h2-console)
- ✅ **Hỗ trợ đầy đủ SQL standard** - tương thích MySQL/PostgreSQL syntax
- ✅ **Nhẹ và nhanh** - phù hợp cho desktop app
- ✅ **Dễ backup** - chỉ cần copy file database

**Nhược điểm:**
- ❌ Không hỗ trợ ENUM trực tiếp (cần dùng VARCHAR hoặc INT)
- ❌ Chỉ 1 connection write đồng thời (đủ cho desktop app)

**Maven Dependency:**
```xml
<dependency>
    <groupId>com.h2database</groupId>
    <artifactId>h2</artifactId>
    <scope>runtime</scope>
</dependency>
```

---

#### **Option 2: MySQL/PostgreSQL (Nếu cần server trung tâm)**
Chỉ dùng khi:
- Nhiều người dùng cần chia sẻ data real-time
- Cần deploy server backend riêng
- Cần tính năng database server đầy đủ

**Setup phức tạp hơn:**
```properties
# MySQL
spring.datasource.url=jdbc:mysql://localhost:3306/pverse_db
spring.datasource.username=root
spring.datasource.password=your_password
spring.jpa.database-platform=org.hibernate.dialect.MySQLDialect
```

---

### 📝 Điều chỉnh SQL Schema cho H2

#### Thay thế ENUM bằng VARCHAR:
```sql
-- Thay vì:
theme ENUM('light', 'dark') DEFAULT 'dark'

-- Dùng:
theme VARCHAR(20) DEFAULT 'dark' CHECK (theme IN ('light', 'dark'))
```

#### Thay thế DATETIME:
```sql
-- H2 hỗ trợ TIMESTAMP
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
```

---

## III. CẤU TRÚC DATABASE ĐƠN GIẢM - 15 BẢNG (H2 Compatible)

### A. USER MANAGEMENT MODULE (2 bảng)

#### 1. **users** (Bảng người dùng - ĐƠN GIẢN)
```sql
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,  -- MD5 hoặc BCrypt đơn giản
    display_name VARCHAR(100),
    avatar_url VARCHAR(255),
    bio TEXT,
    is_online BOOLEAN DEFAULT FALSE,
    last_seen_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_username (username),
    INDEX idx_email (email)
);

-- Ví dụ data:
INSERT INTO users (username, email, password, display_name) 
VALUES ('jbledgt', 'john@example.com', MD5('password123'), 'Hoàng Nguyễn');
```

#### 2. **user_settings** (Cài đặt người dùng)
```sql
CREATE TABLE user_settings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    theme VARCHAR(20) DEFAULT 'dark' CHECK (theme IN ('light', 'dark')),
    language VARCHAR(10) DEFAULT 'vi',
    hotkey_capture VARCHAR(50) DEFAULT 'Ctrl+Shift+1',
    smart_context_enabled BOOLEAN DEFAULT TRUE,
    moment_visibility ENUM('all_friends', 'private') DEFAULT 'all_friends',
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY idx_user_settings (user_id)
);
```

---

### B. SOCIAL NETWORK MODULE (2 bảng)

#### 3. **friendships** (Quan hệ bạn bè - ĐƠN GIẢN)
```sql
CREATE TABLE friendships (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    friend_id INT NOT NULL,
    status ENUM('pending', 'accepted', 'rejected') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (friend_id) REFERENCES users(id) ON DELETE CASCADE,
    
    UNIQUE KEY idx_friendship_pair (user_id, friend_id),
    INDEX idx_user_status (user_id, status),
    
    -- Đảm bảo không tự kết bạn với chính mình
    CHECK (user_id != friend_id)
);

-- Note: Quan hệ 2 chiều - cần insert 2 records hoặc handle trong application
```

#### 4. **blocked_users** (Chặn người dùng)
```sql
CREATE TABLE blocked_users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    blocker_id INT NOT NULL,
    blocked_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (blocker_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (blocked_id) REFERENCES users(id) ON DELETE CASCADE,
    
    UNIQUE KEY idx_block_pair (blocker_id, blocked_id),
    CHECK (blocker_id != blocked_id)
);
```

---

### C. MOMENTS MODULE (5 bảng)

#### 5. **moments** (Khoảnh khắc/Posts)
```sql
CREATE TABLE moments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    caption TEXT,
    image_path VARCHAR(255) NOT NULL,  -- Local file path thay vì URL
    context_type ENUM('music', 'game', 'work', 'browser', 'other') NULL,
    context_details VARCHAR(255),  -- "Spotify - Blinding Lights", "League of Legends"
    visibility ENUM('all_friends', 'private') DEFAULT 'all_friends',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    
    INDEX idx_user_created (user_id, created_at DESC),
    INDEX idx_created_at (created_at DESC)
);

-- Ví dụ:
INSERT INTO moments (user_id, caption, image_path, context_type, context_details) 
VALUES (1, 'Chill evening 🎵', '/uploads/moments/user1_20231018_123456.png', 
        'music', 'Spotify - Blinding Lights - The Weeknd');
```

#### 6. **moment_reactions** (Reactions)
```sql
CREATE TABLE moment_reactions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    moment_id INT NOT NULL,
    user_id INT NOT NULL,
    reaction_type ENUM('like', 'love', 'haha', 'wow', 'sad', 'angry') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (moment_id) REFERENCES moments(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    
    -- Mỗi user chỉ react 1 lần trên 1 moment
    UNIQUE KEY idx_moment_user_reaction (moment_id, user_id),
    INDEX idx_moment_reactions (moment_id)
);
```

#### 7. **moment_comments** (Bình luận)
```sql
CREATE TABLE moment_comments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    moment_id INT NOT NULL,
    user_id INT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (moment_id) REFERENCES moments(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    
    INDEX idx_moment_comments (moment_id, created_at)
);
```

#### 8. **moment_saves** (Lưu moment yêu thích)
```sql
CREATE TABLE moment_saves (
    id INT PRIMARY KEY AUTO_INCREMENT,
    moment_id INT NOT NULL,
    user_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (moment_id) REFERENCES moments(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    
    UNIQUE KEY idx_moment_user_save (moment_id, user_id),
    INDEX idx_user_saves (user_id, created_at DESC)
);
```

#### 9. **registered_applications** (Danh sách app có thể detect)
```sql
CREATE TABLE registered_applications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    app_name VARCHAR(100) NOT NULL UNIQUE,
    app_type ENUM('music', 'game', 'productivity', 'browser', 'other') NOT NULL,
    executable_name VARCHAR(255),  -- "Spotify.exe", "LeagueClient.exe"
    window_title_pattern VARCHAR(255),  -- Pattern để detect, VD: "%Spotify%"
    icon_path VARCHAR(255),
    supports_join_in BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed data mặc định:
INSERT INTO registered_applications (app_name, app_type, executable_name, supports_join_in) VALUES
('Spotify', 'music', 'Spotify.exe', TRUE),
('League of Legends', 'game', 'LeagueClient.exe', TRUE),
('VALORANT', 'game', 'VALORANT.exe', TRUE),
('Visual Studio Code', 'productivity', 'Code.exe', FALSE),
('Google Chrome', 'browser', 'chrome.exe', FALSE);
```

---

### D. MESSAGING MODULE (3 bảng)

#### 10. **conversations** (Cuộc hội thoại - CHỈ 1-1)
```sql
CREATE TABLE conversations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user1_id INT NOT NULL,  -- Đơn giản: lưu 2 user trong 1 record
    user2_id INT NOT NULL,
    last_message_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user1_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (user2_id) REFERENCES users(id) ON DELETE CASCADE,
    
    -- Đảm bảo unique conversation giữa 2 user
    UNIQUE KEY idx_conversation_users (user1_id, user2_id),
    INDEX idx_last_message (last_message_at DESC),
    
    CHECK (user1_id < user2_id)  -- user1_id luôn nhỏ hơn để tránh duplicate
);
```

#### 11. **messages** (Tin nhắn)
```sql
CREATE TABLE messages (
    id INT PRIMARY KEY AUTO_INCREMENT,
    conversation_id INT NOT NULL,
    sender_id INT NOT NULL,
    message_type ENUM('text', 'image', 'moment_share') DEFAULT 'text',
    content TEXT,
    image_path VARCHAR(255) NULL,
    shared_moment_id INT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (shared_moment_id) REFERENCES moments(id) ON DELETE SET NULL,
    
    INDEX idx_conversation_messages (conversation_id, created_at DESC),
    INDEX idx_sender_messages (sender_id, created_at DESC)
);
```

#### 12. **notifications** (Thông báo đơn giản)
```sql
CREATE TABLE notifications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    type ENUM('friend_request', 'friend_accepted', 'moment_reaction', 
              'moment_comment', 'message', 'join_request') NOT NULL,
    content TEXT NOT NULL,  -- "John Doe sent you a friend request"
    actor_id INT,  -- User gây ra notification
    reference_id INT,  -- ID của moment/message/friendship...
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (actor_id) REFERENCES users(id) ON DELETE CASCADE,
    
    INDEX idx_user_unread (user_id, is_read, created_at DESC)
);
```

---

### E. JOIN IN FEATURE MODULE (2 bảng)

#### 13. **join_requests** (Yêu cầu Join In)
```sql
CREATE TABLE join_requests (
    id INT PRIMARY KEY AUTO_INCREMENT,
    moment_id INT NOT NULL,
    requester_id INT NOT NULL,  -- Người yêu cầu join
    host_id INT NOT NULL,  -- Người đăng moment
    activity_type ENUM('music', 'game', 'other') NOT NULL,
    status ENUM('pending', 'accepted', 'rejected') DEFAULT 'pending',
    message TEXT,  -- "Let's play together!"
    invite_data VARCHAR(255),  -- Spotify link hoặc Game ID
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    responded_at TIMESTAMP NULL,
    
    FOREIGN KEY (moment_id) REFERENCES moments(id) ON DELETE CASCADE,
    FOREIGN KEY (requester_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (host_id) REFERENCES users(id) ON DELETE CASCADE,
    
    INDEX idx_host_status (host_id, status),
    INDEX idx_requester_status (requester_id, status)
);
```

#### 14. **join_sessions** (Session Join đang active - Optional)
```sql
CREATE TABLE join_sessions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    request_id INT NOT NULL,
    host_id INT NOT NULL,
    guest_id INT NOT NULL,
    activity_type ENUM('music', 'game', 'other') NOT NULL,
    session_info TEXT,  -- JSON string: {"spotify_jam_link": "...", "game_server": "..."}
    status ENUM('active', 'completed') DEFAULT 'active',
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMP NULL,
    
    FOREIGN KEY (request_id) REFERENCES join_requests(id) ON DELETE CASCADE,
    FOREIGN KEY (host_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (guest_id) REFERENCES users(id) ON DELETE CASCADE,
    
    INDEX idx_host_active (host_id, status),
    INDEX idx_guest_active (guest_id, status)
);
```

---

### F. HELPER TABLE (1 bảng - Optional nhưng hữu ích)

#### 15. **system_logs** (Log hoạt động hệ thống)
```sql
CREATE TABLE system_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    log_type ENUM('error', 'info', 'warning') NOT NULL,
    message TEXT NOT NULL,
    user_id INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_created_at (created_at DESC)
);
```

---

## III. QUAN HỆ GIỮA CÁC BẢNG (ERD - Đơn giản)

```
┌─────────────┐
│   users     │───┐
└─────────────┘   │
      │           │
      │ 1:1       │ 1:N
      ▼           ▼
┌──────────────┐  ┌─────────────┐
│user_settings │  │  moments    │
└──────────────┘  └─────────────┘
                        │
                        │ 1:N
                        ├
                        ▼                          
                  ┌──────────┐   
                  │reactions │   
                  └──────────┘    

┌─────────────┐
│   users     │───────┐
└─────────────┘       │ N:N
      │               ▼
      │         ┌──────────────┐
      │         │ friendships  │
      │         └──────────────┘
      │
      │ 1:N
      ├────────────────┬──────────────────┐
      ▼                ▼                  ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│conversations │ │notifications │ │blocked_users │
└──────────────┘ └──────────────┘ └──────────────┘
      │
      │ 1:N
      ▼
┌──────────────┐
│   messages   │
└──────────────┘
```

---

## IV. QUERIES QUAN TRỌNG (Cho Backend API)

### 1. Feed của User (Moments từ bạn bè)
```sql
-- Lấy 20 moments mới nhất từ bạn bè
SELECT 
    m.*,
    u.username,
    u.avatar_url,
    u.display_name,
    COUNT(DISTINCT mr.id) as reaction_count,
    COUNT(DISTINCT mc.id) as comment_count,
    (SELECT reaction_type FROM moment_reactions 
     WHERE moment_id = m.id AND user_id = ? LIMIT 1) as my_reaction,
    (SELECT COUNT(*) FROM moment_saves 
     WHERE moment_id = m.id AND user_id = ?) as is_saved
FROM moments m
JOIN users u ON m.user_id = u.id
LEFT JOIN moment_reactions mr ON m.id = mr.moment_id
LEFT JOIN moment_comments mc ON m.id = mc.moment_id
WHERE m.user_id IN (
    SELECT friend_id FROM friendships 
    WHERE user_id = ? AND status = 'accepted'
)
AND m.visibility = 'all_friends'
GROUP BY m.id
ORDER BY m.created_at DESC
LIMIT 20;
```

### 2. Danh sách bạn bè Online
```sql
SELECT 
    u.id,
    u.username,
    u.display_name,
    u.avatar_url,
    u.is_online,
    u.last_seen_at
FROM users u
JOIN friendships f ON u.id = f.friend_id
WHERE f.user_id = ?
AND f.status = 'accepted'
ORDER BY u.is_online DESC, u.last_seen_at DESC;
```

### 3. Lấy Conversations của User
```sql
SELECT 
    c.*,
    CASE 
        WHEN c.user1_id = ? THEN u2.username
        ELSE u1.username
    END as other_username,
    CASE 
        WHEN c.user1_id = ? THEN u2.avatar_url
        ELSE u1.avatar_url
    END as other_avatar,
    (SELECT COUNT(*) FROM messages 
     WHERE conversation_id = c.id 
     AND sender_id != ? 
     AND is_read = FALSE) as unread_count,
    (SELECT content FROM messages 
     WHERE conversation_id = c.id 
     ORDER BY created_at DESC LIMIT 1) as last_message
FROM conversations c
JOIN users u1 ON c.user1_id = u1.id
JOIN users u2 ON c.user2_id = u2.id
WHERE c.user1_id = ? OR c.user2_id = ?
ORDER BY c.last_message_at DESC;
```

### 4. Notifications chưa đọc
```sql
SELECT 
    n.*,
    u.username as actor_username,
    u.avatar_url as actor_avatar
FROM notifications n
LEFT JOIN users u ON n.actor_id = u.id
WHERE n.user_id = ?
AND n.is_read = FALSE
ORDER BY n.created_at DESC
LIMIT 50;
```

### 5. Join Requests đang pending
```sql
SELECT 
    jr.*,
    u.username as requester_username,
    u.avatar_url as requester_avatar,
    m.image_path,
    m.context_details
FROM join_requests jr
JOIN users u ON jr.requester_id = u.id
JOIN moments m ON jr.moment_id = m.id
WHERE jr.host_id = ?
AND jr.status = 'pending'
ORDER BY jr.created_at DESC;
```

---

## V. INDEXES QUAN TRỌNG (Đã có trong CREATE TABLE)

### Tóm tắt các Index cần thiết:
```sql
-- Users
CREATE INDEX idx_username ON users(username);
CREATE INDEX idx_email ON users(email);

-- Friendships
CREATE INDEX idx_user_status ON friendships(user_id, status);

-- Moments
CREATE INDEX idx_user_created ON moments(user_id, created_at DESC);
CREATE INDEX idx_created_at ON moments(created_at DESC);

-- Reactions & Comments
CREATE INDEX idx_moment_reactions ON moment_reactions(moment_id);
CREATE INDEX idx_moment_comments ON moment_comments(moment_id, created_at);

-- Messages
CREATE INDEX idx_conversation_messages ON messages(conversation_id, created_at DESC);

-- Notifications
CREATE INDEX idx_user_unread ON notifications(user_id, is_read, created_at DESC);
```

---

## VI. PHÂN CÔNG CÔNG VIỆC (4 SINH VIÊN)

### 👤 Sinh viên 1: User & Authentication Module
**Nhiệm vụ:**
- Setup database và connection
- Implement bảng `users`, `user_settings`
- API: Register, Login, Logout, Update profile
- Password hashing (MD5 hoặc BCrypt)
- Session management đơn giản (JWT hoặc Session-based)

**Deliverables:**
- User registration/login working
- Profile update API
- Database migration scripts

---

### 👥 Sinh viên 2: Social Network Module
**Nhiệm vụ:**
- Implement bảng `friendships`, `blocked_users`
- API: Send friend request, Accept/Reject, Unfriend, Block
- Friend list view
- Friend suggestions (simple: mutual friends)

**Deliverables:**
- Friend management working
- Friend list UI/API
- Block feature working

---

### 📸 Sinh viên 3: Moments & Context Detection Module
**Nhiệm vụ:**
- Implement bảng `moments`, `moment_reactions`, `moment_comments`, `moment_saves`
- Smart context detection (detect Spotify, Games, VS Code)
- API: Create moment, React, Comment, Save
- Feed generation logic

**Deliverables:**
- Moment posting working với screenshot
- Context detection cho ít nhất 3 apps
- Feed hiển thị moments của friends
- Reactions & Comments working

---

### 💬 Sinh viên 4: Messaging & Join In Module
**Nhiệm vụ:**
- Implement bảng `conversations`, `messages`, `notifications`
- Implement bảng `join_requests`, `join_sessions`
- API: Send message, Load conversation, Mark as read
- Join In request & accept flow
- Real-time messaging (WebSocket hoặc Polling đơn giản)

**Deliverables:**
- 1-1 Chat working
- Notifications working
- Join In request/accept flow
- Real-time message updates (polling cũng OK)

---

## VII. TECH STACK CHO JAVA SPRING BOOT + REACT DESKTOP APP

### 🏗️ Architecture Overview
```
┌─────────────────────────────────────────┐
│         Desktop Application             │
│  ┌───────────────────────────────────┐  │
│  │    React UI (Frontend)            │  │
│  │    - Components, State, UI        │  │
│  └───────────────┬───────────────────┘  │
│                  │ HTTP/REST API         │
│  ┌───────────────▼───────────────────┐  │
│  │  Spring Boot (Embedded Backend)   │  │
│  │  - REST Controllers               │  │
│  │  - Services & Business Logic      │  │
│  │  - Spring Data JPA                │  │
│  └───────────────┬───────────────────┘  │
│                  │ JDBC                  │
│  ┌───────────────▼───────────────────┐  │
│  │    H2 Database (File-based)       │  │
│  │    ./data/pverse-db.mv.db         │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

### Backend (Spring Boot 3.x)
**Dependencies (pom.xml):**
```xml
<dependencies>
    <!-- Spring Boot Starter Web -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
    
    <!-- Spring Boot Starter Data JPA -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-data-jpa</artifactId>
    </dependency>
    
    <!-- H2 Database (EMBEDDED - OPTION 1) -->
    <dependency>
        <groupId>com.h2database</groupId>
        <artifactId>h2</artifactId>
        <scope>runtime</scope>
    </dependency>
    
    <!-- Spring Boot Starter Security (JWT) -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-security</artifactId>
    </dependency>
    
    <!-- JWT Token -->
    <dependency>
        <groupId>io.jsonwebtoken</groupId>
        <artifactId>jjwt-api</artifactId>
        <version>0.11.5</version>
    </dependency>
    
    <!-- Spring Boot Starter Validation -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-validation</artifactId>
    </dependency>
    
    <!-- Lombok (Optional - giảm boilerplate code) -->
    <dependency>
        <groupId>org.projectlombok</groupId>
        <artifactId>lombok</artifactId>
        <optional>true</optional>
    </dependency>
    
    <!-- Spring Boot DevTools (Development) -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-devtools</artifactId>
        <scope>runtime</scope>
        <optional>true</optional>
    </dependency>
</dependencies>
```

**application.properties:**
```properties
# Server Configuration (Embedded backend cho desktop app)
server.port=8080
server.address=localhost

# H2 Database Configuration (FILE-BASED)
spring.datasource.url=jdbc:h2:file:./data/pverse-db
spring.datasource.driverClassName=org.h2.Driver
spring.datasource.username=sa
spring.datasource.password=

# JPA/Hibernate Configuration
spring.jpa.database-platform=org.hibernate.dialect.H2Dialect
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true

# H2 Console (Development only)
spring.h2.console.enabled=true
spring.h2.console.path=/h2-console

# File Upload Configuration
spring.servlet.multipart.max-file-size=10MB
spring.servlet.multipart.max-request-size=10MB
app.upload.dir=./uploads

# JWT Configuration
app.jwt.secret=your-secret-key-change-this-in-production
app.jwt.expiration=86400000

# Logging
logging.level.org.springframework=INFO
logging.level.com.pverse=DEBUG
```

---

### Frontend (React)
**Tech Stack:**
- **React 18+** - UI library
- **Vite** - Build tool (nhanh hơn Create React App)
- **React Router** - Navigation
- **Axios** - HTTP client
- **Zustand** hoặc **Context API** - State management
- **TailwindCSS** - Styling
- **React Query** - Data fetching & caching (optional)

**package.json:**
```json
{
  "name": "pverse-frontend",
  "version": "1.0.0",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.0",
    "axios": "^1.6.0",
    "zustand": "^4.4.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.2.0",
    "vite": "^5.0.0",
    "tailwindcss": "^3.3.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0"
  }
}
```

---

### Desktop Wrapper
**Option 1: Electron (KHUYẾN NGHỊ)**
```json
{
  "name": "pverse-desktop",
  "main": "electron/main.js",
  "scripts": {
    "electron:dev": "concurrently \"npm run dev\" \"electron .\"",
    "electron:build": "electron-builder"
  },
  "devDependencies": {
    "electron": "^28.0.0",
    "electron-builder": "^24.9.0",
    "concurrently": "^8.2.0"
  }
}
```

**electron/main.js (Setup cơ bản):**
```javascript
const { app, BrowserWindow } = require('electron');
const path = require('path');

// Start Spring Boot backend khi app khởi động
const { spawn } = require('child_process');
let backendProcess;

function startBackend() {
  // Start Spring Boot JAR
  backendProcess = spawn('java', ['-jar', 'backend/pverse-backend.jar']);
  
  backendProcess.stdout.on('data', (data) => {
    console.log(`Backend: ${data}`);
  });
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  // Load React app
  if (process.env.NODE_ENV === 'development') {
    win.loadURL('http://localhost:5173'); // Vite dev server
  } else {
    win.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

app.whenReady().then(() => {
  startBackend();
  
  // Đợi backend start (2-3 giây)
  setTimeout(createWindow, 3000);
});

app.on('window-all-closed', () => {
  if (backendProcess) {
    backendProcess.kill();
  }
  app.quit();
});
```

**Option 2: Tauri (Nhẹ hơn Electron)**
- Dùng Rust thay vì Node.js
- File size nhỏ hơn nhiều
- Performance tốt hơn
- Setup phức tạp hơn một chút

---

### File Storage (Cho Screenshots & Avatars)
**Backend Service:**
```java
@Service
public class FileStorageService {
    
    @Value("${app.upload.dir}")
    private String uploadDir;
    
    public String saveScreenshot(MultipartFile file, Long userId) throws IOException {
        String timestamp = LocalDateTime.now()
            .format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
        
        String filename = String.format("user%d_%s.png", userId, timestamp);
        String relativePath = "moments/" + filename;
        
        Path uploadPath = Paths.get(uploadDir, "moments");
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }
        
        Path filePath = uploadPath.resolve(filename);
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
        
        return "/" + relativePath; // Return relative path để lưu vào DB
    }
    
    public Resource loadFile(String filename) {
        Path filePath = Paths.get(uploadDir).resolve(filename);
        Resource resource = new UrlResource(filePath.toUri());
        
        if (resource.exists()) {
            return resource;
        } else {
            throw new FileNotFoundException("File not found: " + filename);
        }
    }
}
```

**Frontend Upload:**
```javascript
// React component để upload screenshot
const uploadScreenshot = async (file, caption, contextType) => {
  const formData = new FormData();
  formData.append('image', file);
  formData.append('caption', caption);
  formData.append('contextType', contextType);
  
  const response = await axios.post('http://localhost:8080/api/moments', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      'Authorization': `Bearer ${token}`
    }
  });
  
  return response.data;
};
```

---

### Real-time Messaging cho Desktop App

#### **Option 1: WebSocket (KHUYẾN NGHỊ)**
**Backend (Spring Boot):**
```java
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {
    
    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        config.enableSimpleBroker("/topic", "/queue");
        config.setApplicationDestinationPrefixes("/app");
    }
    
    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws")
                .setAllowedOrigins("http://localhost:5173")
                .withSockJS();
    }
}

@Controller
public class MessageController {
    
    @MessageMapping("/chat.send")
    @SendToUser("/queue/messages")
    public Message sendMessage(Message message) {
        messageService.saveMessage(message);
        return message;
    }
}
```

**Frontend (React):**
```javascript
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

const connectWebSocket = () => {
  const socket = new SockJS('http://localhost:8080/ws');
  const stompClient = new Client({
    webSocketFactory: () => socket,
    onConnect: () => {
      console.log('Connected to WebSocket');
      
      // Subscribe to personal message queue
      stompClient.subscribe('/user/queue/messages', (message) => {
        const newMessage = JSON.parse(message.body);
        // Update UI with new message
        addMessageToConversation(newMessage);
      });
    }
  });
  
  stompClient.activate();
  return stompClient;
};
```

**Dependencies:**
```xml
<!-- Backend -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-websocket</artifactId>
</dependency>
```

```json
// frontend
"dependencies": {
  "sockjs-client": "^1.6.1",
  "@stomp/stompjs": "^7.0.0"
}
```

#### **Option 2: HTTP Long Polling (Đơn giản hơn)**
```javascript
// Frontend - Poll messages mỗi 3 giây
useEffect(() => {
  const pollMessages = setInterval(async () => {
    const response = await axios.get('/api/messages/unread');
    if (response.data.length > 0) {
      updateMessages(response.data);
    }
  }, 3000);
  
  return () => clearInterval(pollMessages);
}, []);
```

---

### Context Detection (Windows Process Detection)

**Java Service (JNA - Java Native Access):**
```java
@Service
public class ContextDetectionService {
    
    public ContextInfo detectCurrentContext() {
        // Sử dụng JNA để lấy active window title
        String windowTitle = getActiveWindowTitle();
        
        // Match với registered applications
        RegisteredApplication app = registeredAppRepository
            .findByWindowTitlePattern(windowTitle);
        
        if (app != null) {
            return ContextInfo.builder()
                .contextType(app.getAppType())
                .contextDetails(extractDetails(windowTitle, app))
                .build();
        }
        
        return null;
    }
    
    private native String getActiveWindowTitle();
    // Implementation using JNA or ProcessHandle API
}
```

**Dependencies:**
```xml
<dependency>
    <groupId>net.java.dev.jna</groupId>
    <artifactId>jna</artifactId>
    <version>5.13.0</version>
</dependency>
<dependency>
    <groupId>net.java.dev.jna</groupId>
    <artifactId>jna-platform</artifactId>
    <version>5.13.0</version>
</dependency>
```

---

### Hotkey Global (Chụp Screenshot)

**Electron Main Process:**
```javascript
const { globalShortcut } = require('electron');

app.whenReady().then(() => {
  // Register global hotkey Ctrl+Shift+1
  globalShortcut.register('CommandOrControl+Shift+1', () => {
    // Trigger screenshot
    mainWindow.webContents.send('trigger-screenshot');
  });
});
```

**React Component:**
```javascript
useEffect(() => {
  // Listen for hotkey trigger from Electron
  window.electron?.onTriggerScreenshot(() => {
    captureScreen();
  });
}, []);

const captureScreen = async () => {
  // Use Electron's desktopCapturer API
  const screenshot = await window.electron.captureScreen();
  
  // Show preview modal
  setScreenshotPreview(screenshot);
  setShowUploadModal(true);
};
```

---

## VIII. PROJECT STRUCTURE

```
pverse/
├── backend/                          # Spring Boot Backend
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/pverse/
│   │   │   │   ├── PverseApplication.java
│   │   │   │   ├── config/
│   │   │   │   │   ├── SecurityConfig.java
│   │   │   │   │   ├── WebSocketConfig.java
│   │   │   │   │   └── JwtConfig.java
│   │   │   │   ├── controller/
│   │   │   │   │   ├── AuthController.java
│   │   │   │   │   ├── UserController.java
│   │   │   │   │   ├── MomentController.java
│   │   │   │   │   ├── FriendController.java
│   │   │   │   │   └── MessageController.java
│   │   │   │   ├── service/
│   │   │   │   │   ├── UserService.java
│   │   │   │   │   ├── MomentService.java
│   │   │   │   │   ├── FriendService.java
│   │   │   │   │   ├── MessageService.java
│   │   │   │   │   ├── ContextDetectionService.java
│   │   │   │   │   └── FileStorageService.java
│   │   │   │   ├── repository/
│   │   │   │   │   ├── UserRepository.java
│   │   │   │   │   ├── MomentRepository.java
│   │   │   │   │   ├── FriendshipRepository.java
│   │   │   │   │   └── MessageRepository.java
│   │   │   │   ├── model/
│   │   │   │   │   ├── User.java
│   │   │   │   │   ├── Moment.java
│   │   │   │   │   ├── Friendship.java
│   │   │   │   │   └── Message.java
│   │   │   │   └── dto/
│   │   │   │       ├── LoginRequest.java
│   │   │   │       ├── MomentDto.java
│   │   │   │       └── MessageDto.java
│   │   │   └── resources/
│   │   │       ├── application.properties
│   │   │       └── db/migration/
│   │   │           ├── V1__create_users.sql
│   │   │           ├── V2__create_friendships.sql
│   │   │           └── V3__create_moments.sql
│   │   └── test/
│   └── pom.xml
│
├── frontend/                         # React Frontend
│   ├── src/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   ├── components/
│   │   │   ├── Feed.jsx
│   │   │   ├── Post.jsx
│   │   │   ├── CreatePostModal.jsx
│   │   │   ├── Messenger.jsx
│   │   │   └── Header.jsx
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Profile.jsx
│   │   │   ├── Messages.jsx
│   │   │   └── Settings.jsx
│   │   ├── services/
│   │   │   ├── api.js
│   │   │   ├── authService.js
│   │   │   ├── momentService.js
│   │   │   └── websocket.js
│   │   ├── store/
│   │   │   ├── authStore.js
│   │   │   ├── momentStore.js
│   │   │   └── messageStore.js
│   │   └── utils/
│   │       ├── screenshot.js
│   │       └── contextDetection.js
│   ├── package.json
│   └── vite.config.js
│
├── electron/                         # Electron Wrapper
│   ├── main.js
│   ├── preload.js
│   └── package.json
│
├── data/                            # Database & Uploads (Generated)
│   ├── pverse-db.mv.db             # H2 Database file
│   └── uploads/
│       ├── avatars/
│       └── moments/
│
└── README.md
```

---

## IX. MIGRATION SCRIPT (Flyway cho H2)
