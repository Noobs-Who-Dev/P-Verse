# KẾ HOẠCH THIẾT KẾ DATABASE - P-VERSE

## Tổng Quan Dự Án
**P-Verse** là một ứng dụng **Java Desktop Application** LOCAL kết nối nhóm bạn thân qua "khoảnh khắc số" tức thì, biến màn hình máy tính thành cửa sổ nhìn vào thế giới số của nhau.

**Phạm vi**: Ứng dụng mạng xã hội LOCAL, tập trung vào tính năng CORE, phù hợp cho dự án bài tập lớn 4 sinh viên.

**Công nghệ**: Java 21 + Spring Boot + React.js + JPA (MySQL) + WebSocket (SockJS, STOMP)

---

## I. PHÂN TÍCH YÊU CẦU - PHIÊN BẢN ĐƠN GIẢN

### 1. Tính Năng CORE (Bắt buộc triển khai - CÓ DATABASE)
- ✅ **User Management**: Đăng ký, đăng nhập cơ bản
- ✅ **Moments/Posts**: Chia sẻ screenshot với caption
- ✅ **Social Network**: Kết bạn, xem feed bạn bè
- ✅ **Reactions**: Like/Love/Haha... trên moments
- ✅ **Messaging**: Chat 1-1 cơ bản + moment_reply

### 2. Tính Năng Nice to Have (KHÔNG CẦN DATABASE)
- **Smart Context**: Tự động nhận diện app đang dùng (logic frontend/service layer)
- **Join In**: Yêu cầu tham gia hoạt động (logic frontend)
- **Save post**: Lưu moment yêu thích

### 3. Tính Năng LOẠI BỎ (Không triển khai)
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

## II. CẤU TRÚC DATABASE - 9 BẢNG (MySQL)

### A. USER MANAGEMENT MODULE (2 bảng)

#### 1. **users** (Bảng người dùng - ĐƠN GIẢN)
```sql
-- ✅ Đã có trong users table
CREATE TABLE users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL, -- Bcrypt
    display_name VARCHAR(100),
    phone_number VARCHAR(20),
    avatar_url VARCHAR(255),
    bio TEXT,
    is_online TINYINT(1) DEFAULT 0,
    last_seen_at DATETIME DEFAULT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_username (username),
    INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

#### 2. **user_settings** (Cài đặt người dùng - Optional cho MVP)
```sql
CREATE TABLE user_settings (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL UNIQUE,
    
    -- ✅ CORE settings (MVP Phase 1 - 3 fields)
    theme VARCHAR(20) DEFAULT 'dark' 
        CHECK (theme IN ('dark', 'light', 'auto')),
    language VARCHAR(10) DEFAULT 'vi' 
        CHECK (language IN ('vi', 'en')),
    notifications_enabled TINYINT(1) DEFAULT 1,
    
    -- ⚠️ FUTURE settings (Phase 2+)
    extended_settings JSON DEFAULT NULL,
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

### B. SOCIAL NETWORK MODULE (2 bảng)

#### 3. **friendships** (Quan hệ bạn bè)
```sql
CREATE TABLE friendships (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,      -- Luôn là user ID nhỏ hơn
    friend_id BIGINT NOT NULL,    -- Luôn là user ID lớn hơn
    status VARCHAR(20) DEFAULT 'pending',
    requester_id BIGINT NOT NULL, -- ← MỚI: Ai là người gửi request
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (friend_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (requester_id) REFERENCES users(id) ON DELETE CASCADE,
    
    UNIQUE KEY idx_friendship_pair (user_id, friend_id),
    INDEX idx_user_status (user_id, status),
    INDEX idx_friend_status (friend_id, status),
    
    -- ✅ Enforce user_id luôn nhỏ hơn friend_id
    CONSTRAINT chk_user_order CHECK (user_id < friend_id),
    CONSTRAINT chk_no_self_friend CHECK (user_id != friend_id),
    -- ✅ requester_id phải là 1 trong 2 người
    CONSTRAINT chk_requester CHECK (requester_id IN (user_id, friend_id))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

#### 4. **blocked_users** (Chặn người dùng - Optional cho MVP)
```sql
CREATE TABLE blocked_users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    blocker_id BIGINT NOT NULL,
    blocked_id BIGINT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (blocker_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (blocked_id) REFERENCES users(id) ON DELETE CASCADE,
    
    UNIQUE KEY idx_block_pair (blocker_id, blocked_id),
    CONSTRAINT chk_no_self_block CHECK (blocker_id != blocked_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

### C. MOMENTS MODULE (3 bảng)

#### 5. **moments** (Khoảnh khắc/Posts)
```sql
-- Bảng moments (simplified - không có context)
CREATE TABLE moments (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    caption TEXT,
    image_path VARCHAR(255) NOT NULL,
    visibility VARCHAR(20) DEFAULT 'all_friends'
        CHECK (visibility IN ('all_friends', 'close_friends', 'private')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    
    INDEX idx_user_created (user_id, created_at DESC),
    INDEX idx_created_at (created_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

```sql
-- Bảng moment_contexts (reserved for future feature)
CREATE TABLE moment_contexts (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    moment_id BIGINT NOT NULL UNIQUE,
    context_type VARCHAR(50) NULL 
        CHECK (context_type IN ('music', 'game', 'work', 'browser', 'other')),
    context_details VARCHAR(255) NULL,
    app_name VARCHAR(100),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (moment_id) REFERENCES moments(id) ON DELETE CASCADE,
    
    INDEX idx_context_type (context_type),
    
    CONSTRAINT chk_context_consistency 
        CHECK (
            (context_type IS NULL AND context_details IS NULL) OR
            (context_type IS NOT NULL AND context_details IS NOT NULL)
        )
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Note: Bảng này chưa được sử dụng trong MVP
-- Dành cho tính năng "Activity Context Detection" ở phiên bản sau
```

#### 6. **moment_reactions** (Reactions)
```sql
CREATE TABLE moment_reactions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    moment_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    reaction_type VARCHAR(20) NOT NULL 
        CHECK (reaction_type IN ('like', 'love', 'haha', 'wow', 'sad', 'angry')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (moment_id) REFERENCES moments(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    
    UNIQUE KEY idx_moment_user_reaction (moment_id, user_id),
    INDEX idx_moment_reactions (moment_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

#### 7. **moment_comments** (bỏ)

---

### D. MESSAGING MODULE (3 bảng)

#### 8. **conversations** (Cuộc hội thoại - CHỈ 1-1)
```sql
CREATE TABLE conversations (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user1_id BIGINT NOT NULL,  -- Đơn giản: lưu 2 user trong 1 record
    user2_id BIGINT NOT NULL,
    last_message_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user1_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (user2_id) REFERENCES users(id) ON DELETE CASCADE,
    
    -- Đảm bảo unique conversation giữa 2 user
    UNIQUE KEY idx_conversation_users (user1_id, user2_id),
    INDEX idx_last_message (last_message_at DESC),
    
    CONSTRAINT chk_user_order CHECK (user1_id < user2_id)  -- user1_id luôn nhỏ hơn để tránh duplicate
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- thêm trigger
DELIMITER $$
CREATE TRIGGER update_conversation_timestamp
AFTER INSERT ON messages
FOR EACH ROW
BEGIN
    -- NEW = record message vừa được insert
    UPDATE conversations 
    SET last_message_at = NEW.created_at 
    WHERE id = NEW.conversation_id;
END$$
DELIMITER ;
```

#### 9. **messages** (Tin nhắn)
```sql
CREATE TABLE messages (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    conversation_id BIGINT NOT NULL,
    sender_id BIGINT NOT NULL,
    
    message_type VARCHAR(20) DEFAULT 'text' 
        CHECK (message_type IN ('text', 'image', 'moment_reply')),
    
    content TEXT,
    image_path VARCHAR(255) NULL,
    replied_moment_id BIGINT NULL,
    
    is_read TINYINT(1) DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (replied_moment_id) REFERENCES moments(id) ON DELETE SET NULL,
    
    INDEX idx_conversation_messages (conversation_id, created_at DESC),
    INDEX idx_sender_messages (sender_id, created_at DESC),
    INDEX idx_unread (conversation_id, is_read),
    
    CONSTRAINT chk_text_has_content 
        CHECK (message_type != 'text' OR (content IS NOT NULL AND CHAR_LENGTH(content) BETWEEN 1 AND 1000)),
    CONSTRAINT chk_image_has_path 
        CHECK (message_type != 'image' OR image_path IS NOT NULL),
    CONSTRAINT chk_reply_has_moment 
        CHECK (message_type != 'moment_reply' OR (replied_moment_id IS NOT NULL AND content IS NOT NULL))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
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
                        ├──────────────┬
                        ▼              ▼    
                  ┌──────────┐  ┌──────────┐
                  │reactions │  │messages  │(reply)
                  └──────────┘  └──────────┘

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
│conversations │ │blocked_users │ │  (future)    │
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
     WHERE moment_id = m.id AND user_id = ? LIMIT 1) as my_reaction
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
     AND is_read = 0) as unread_count,
    (SELECT content FROM messages 
     WHERE conversation_id = c.id 
     ORDER BY created_at DESC LIMIT 1) as last_message
FROM conversations c
JOIN users u1 ON c.user1_id = u1.id
JOIN users u2 ON c.user2_id = u2.id
WHERE c.user1_id = ? OR c.user2_id = ?
ORDER BY c.last_message_at DESC;
```

### 4. Lấy tin nhắn trong conversation
```sql
SELECT 
    m.*,
    u.username as sender_username,
    u.avatar_url as sender_avatar
FROM messages m
JOIN users u ON m.sender_id = u.id
WHERE m.conversation_id = ?
ORDER BY m.created_at DESC
LIMIT 50;
```

### 5. Lấy reactions của một moment
```sql
SELECT 
    mr.*,
    u.username,
    u.avatar_url
FROM moment_reactions mr
JOIN users u ON mr.user_id = u.id
WHERE mr.moment_id = ?
ORDER BY mr.created_at DESC;
```

### 6. Lấy comments của một moment
```sql
SELECT 
    mc.*,
    u.username,
    u.avatar_url,
    u.display_name
FROM moment_comments mc
JOIN users u ON mc.user_id = u.id
WHERE mc.moment_id = ?
ORDER BY mc.created_at ASC;
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
CREATE INDEX idx_friend_status ON friendships(friend_id, status);

-- Moments
CREATE INDEX idx_user_created ON moments(user_id, created_at DESC);
CREATE INDEX idx_created_at ON moments(created_at DESC);

-- Reactions & Comments
CREATE INDEX idx_moment_reactions ON moment_reactions(moment_id);
CREATE INDEX idx_moment_comments ON moment_comments(moment_id, created_at);

-- Conversations & Messages
CREATE INDEX idx_last_message ON conversations(last_message_at DESC);
CREATE INDEX idx_conversation_messages ON messages(conversation_id, created_at DESC);
CREATE INDEX idx_sender_messages ON messages(sender_id, created_at DESC);
```

---

## VI. TECH STACK CHO JAVA SPRING BOOT + REACT DESKTOP APP

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
│  │    MySQL Database (Local)         │  │
│  │    localhost:3306/pverse_db       │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

### 📦 Dependencies cần thiết:

**Backend (Spring Boot - pom.xml):**
- Spring Boot Starter Web
- Spring Boot Starter Data JPA  
- MySQL Connector Java
- Spring Boot Starter WebSocket
- Lombok
- Spring Boot Starter Validation
- Spring Boot Starter Security (Basic)

**Frontend (React - package.json):**
- React + React DOM
- Vite
- TailwindCSS
- Axios (HTTP client)
- SockJS-client + STOMP (WebSocket)
- React Router DOM
- Zustand (State management)

---

## VII. PROJECT STRUCTURE

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
│   │   │   │   │   └── CorsConfig.java
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
│   │   │   │   │   └── FileStorageService.java
│   │   │   │   ├── repository/
│   │   │   │   │   ├── UserRepository.java
│   │   │   │   │   ├── MomentRepository.java
│   │   │   │   │   ├── FriendshipRepository.java
│   │   │   │   │   ├── ConversationRepository.java
│   │   │   │   │   └── MessageRepository.java
│   │   │   │   ├── entity/
│   │   │   │   │   ├── User.java
│   │   │   │   │   ├── UserSettings.java
│   │   │   │   │   ├── Friendship.java
│   │   │   │   │   ├── Moment.java
│   │   │   │   │   ├── MomentReaction.java
│   │   │   │   │   ├── MomentComment.java
│   │   │   │   │   ├── Conversation.java
│   │   │   │   │   └── Message.java
│   │   │   │   └── dto/
│   │   │   │       ├── LoginRequest.java
│   │   │   │       ├── RegisterRequest.java
│   │   │   │       ├── MomentDto.java
│   │   │   │       └── MessageDto.java
│   │   │   └── resources/
│   │   │       ├── application.properties
│   │   │       └── db/migration/
│   │   │           ├── V1__create_users.sql
│   │   │           ├── V2__create_friendships.sql
│   │   │           ├── V3__create_moments.sql
│   │   │           └── V4__create_messages.sql
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
├── data/                            # Uploads folder (Generated at runtime)
│   └── uploads/
│       ├── avatars/
│       └── moments/
│
└── README.md
```

**Note:** 
- MySQL database chạy riêng biệt (localhost:3306)
- Không cần electron wrapper ban đầu - chạy như web app trước
- Có thể thêm Electron sau khi hoàn thành các tính năng CORE

