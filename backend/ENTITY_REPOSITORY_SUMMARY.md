# P-VERSE - ENTITY & REPOSITORY SUMMARY

## ✅ ĐÃ TẠO THÀNH CÔNG TẤT CẢ ENTITY VÀ REPOSITORY

### 📊 ENTITIES (9 bảng)

#### A. USER MANAGEMENT MODULE (2 entities)
1. **User.java** ✅
   - Bảng `users`: Thông tin người dùng cơ bản
   - Fields: id, username, email, password, displayName, phoneNumber, avatarUrl, bio, isOnline, lastSeenAt
   - Annotations: @Entity, @Table, @Index, Lombok

2. **UserSettings.java** ✅
   - Bảng `user_settings`: Cài đặt người dùng
   - Fields: id, user (OneToOne), theme, language, notificationsEnabled, extendedSettings (JSON)
   - Enums: Theme (DARK, LIGHT, AUTO), Language (VI, EN)

#### B. SOCIAL NETWORK MODULE (2 entities)
3. **Friendship.java** ✅
   - Bảng `friendships`: Quan hệ bạn bè
   - Fields: id, user, friend, status, requester, createdAt, updatedAt
   - Enum: FriendshipStatus (PENDING, ACCEPTED, REJECTED, BLOCKED)
   - Validation: user_id < friend_id, không tự kết bạn bản thân

4. **BlockedUser.java** ✅
   - Bảng `blocked_users`: Chặn người dùng
   - Fields: id, blocker, blocked, createdAt
   - Validation: Không thể block chính mình

#### C. MOMENTS MODULE (3 entities)
5. **Moment.java** ✅
   - Bảng `moments`: Khoảnh khắc/Posts
   - Fields: id, user, caption, imagePath, visibility, createdAt
   - Enum: Visibility (ALL_FRIENDS, CLOSE_FRIENDS, PRIVATE)

6. **MomentContext.java** ✅
   - Bảng `moment_contexts`: Ngữ cảnh moment (reserved for future)
   - Fields: id, moment (OneToOne), contextType, contextDetails, appName, createdAt
   - Enum: ContextType (MUSIC, GAME, WORK, BROWSER, OTHER)
   - Validation: contextType và contextDetails phải cùng null hoặc cùng có giá trị

7. **MomentReaction.java** ✅
   - Bảng `moment_reactions`: Reactions trên moment
   - Fields: id, moment, user, reactionType, createdAt
   - Enum: ReactionType (LIKE, LOVE, HAHA, WOW, SAD, ANGRY)
   - Unique constraint: (moment_id, user_id)

#### D. MESSAGING MODULE (2 entities)
8. **Conversation.java** ✅
   - Bảng `conversations`: Cuộc hội thoại 1-1
   - Fields: id, user1, user2, lastMessageAt, createdAt
   - Validation: user1_id < user2_id để tránh duplicate
   - Helper method: getOtherUser(currentUserId)

9. **Message.java** ✅
   - Bảng `messages`: Tin nhắn
   - Fields: id, conversation, sender, messageType, content, imagePath, repliedMoment, isRead, createdAt
   - Enum: MessageType (TEXT, IMAGE, MOMENT_REPLY)
   - Validation: 
     - TEXT: phải có content (1-1000 ký tự)
     - IMAGE: phải có imagePath
     - MOMENT_REPLY: phải có repliedMoment và content

---

### 🗄️ REPOSITORIES (9 repositories)

#### A. USER MANAGEMENT MODULE
1. **UserRepository.java** ✅
   - findByUsername(String username)
   - findByEmail(String email)
   - existsByUsername(String username)
   - existsByEmail(String email)
   - findByUsernameOrEmail(String credential)
   - updateOnlineStatus(userId, isOnline, lastSeenAt)

2. **UserSettingsRepository.java** ✅
   - findByUserId(Long userId)
   - existsByUserId(Long userId)

#### B. SOCIAL NETWORK MODULE
3. **FriendshipRepository.java** ✅
   - findByUserIds(userId1, userId2)
   - findFriendsByUserIdAndStatus(userId, status)
   - findOutgoingRequests(userId)
   - findIncomingRequests(userId)
   - areFriends(userId1, userId2)
   - existsByUserIds(userId1, userId2)
   - countFriends(userId)

4. **BlockedUserRepository.java** ✅
   - findByBlockerIdAndBlockedId(blockerId, blockedId)
   - findByBlockerId(blockerId)
   - findByBlockedId(blockedId)
   - existsByBlockerIdAndBlockedId(blockerId, blockedId)
   - hasBlockedRelationship(userId1, userId2)
   - deleteByBlockerIdAndBlockedId(blockerId, blockedId)

#### C. MOMENTS MODULE
5. **MomentRepository.java** ✅
   - findByUserIdOrderByCreatedAtDesc(userId, pageable)
   - findByUserIdAndVisibilityOrderByCreatedAtDesc(userId, visibility, pageable)
   - findFeedMoments(friendIds, pageable)
   - findFeedMomentsIncludingSelf(friendIds, currentUserId, pageable)
   - countByUserId(userId)
   - countByUserIdAndVisibility(userId, visibility)
   - findTop10ByUserIdOrderByCreatedAtDesc(userId)

6. **MomentContextRepository.java** ✅
   - findByMomentId(momentId)
   - existsByMomentId(momentId)
   - deleteByMomentId(momentId)

7. **MomentReactionRepository.java** ✅
   - findByMomentIdAndUserId(momentId, userId)
   - findByMomentIdOrderByCreatedAtDesc(momentId)
   - findByMomentIdAndReactionType(momentId, reactionType)
   - countByMomentId(momentId)
   - countByMomentIdAndReactionType(momentId, reactionType)
   - existsByMomentIdAndUserId(momentId, userId)
   - deleteByMomentIdAndUserId(momentId, userId)
   - countReactionsByType(momentId)

#### D. MESSAGING MODULE
8. **ConversationRepository.java** ✅
   - findByUserIds(userId1, userId2)
   - findByUserId(userId, pageable)
   - countByUserId(userId)
   - existsByUserIds(userId1, userId2)

9. **MessageRepository.java** ✅
   - findByConversationIdOrderByCreatedAtDesc(conversationId, pageable)
   - findByConversationIdOrderByCreatedAtAsc(conversationId, pageable)
   - findLatestMessageByConversationId(conversationId)
   - countUnreadMessages(conversationId, userId)
   - countTotalUnreadMessages(userId)
   - markAllAsRead(conversationId, userId)
   - findByConversationIdAndMessageType(conversationId, messageType)
   - findMomentRepliesByConversationId(conversationId)
   - countByConversationId(conversationId)

---

## 🎯 ĐIỂM NỔI BẬT

### Entity Design
- ✅ Sử dụng Lombok (@Data, @Builder, @NoArgsConstructor, @AllArgsConstructor) để giảm boilerplate code
- ✅ Hibernate annotations (@CreationTimestamp, @UpdateTimestamp) cho auto timestamp
- ✅ @PrePersist và @PreUpdate để validate dữ liệu trước khi lưu
- ✅ Index strategy cho performance (đặc biệt trên foreign keys và search fields)
- ✅ Enum types cho các trường có giá trị cố định
- ✅ Proper foreign key relationships (@OneToOne, @ManyToOne)

### Repository Design
- ✅ Custom query methods với naming convention của Spring Data JPA
- ✅ @Query annotation cho complex queries
- ✅ Pagination support với Pageable parameter
- ✅ @Modifying annotation cho update/delete queries
- ✅ COUNT, EXISTS queries cho performance
- ✅ Bidirectional search support (friendships, conversations)

### Business Logic Validation
- ✅ **Friendship**: user_id < friend_id (tránh duplicate), requester phải là 1 trong 2 user
- ✅ **BlockedUser**: Không thể block chính mình
- ✅ **Conversation**: user1_id < user2_id (tránh duplicate)
- ✅ **Message**: Validate content theo messageType
- ✅ **MomentContext**: contextType và contextDetails phải consistent

---

## 🚀 BƯỚC TIẾP THEO

### 1. Cấu hình Database
- Cấu hình `application.properties` hoặc `application.yml`
- Thiết lập MySQL connection
- Enable JPA auto-DDL (create-drop cho development)

### 2. Service Layer
- Tạo các Service classes để xử lý business logic
- UserService, FriendshipService, MomentService, MessageService, etc.

### 3. Controller Layer (REST API)
- Tạo các REST Controllers
- AuthController, UserController, FriendshipController, MomentController, MessageController

### 4. DTO Layer
- Tạo các DTO (Data Transfer Objects) để map giữa Entity và API response
- UserDTO, MomentDTO, MessageDTO, etc.

### 5. Security Configuration
- Spring Security setup
- JWT authentication
- Password encoding (BCrypt)

### 6. WebSocket Configuration
- Setup WebSocket cho real-time messaging
- STOMP protocol configuration

### 7. File Upload Service
- Xử lý upload avatar, moment images, message images
- File storage strategy (local filesystem hoặc cloud storage)

---

## 📝 NOTES

- Database được thiết kế đơn giản phù hợp cho bài tập lớn 4 sinh viên
- Focus vào CORE features: Users, Friends, Moments, Messages
- Extended features (MomentContext, UserSettings.extendedSettings) sử dụng JSON để linh hoạt mở rộng sau
- Không có các tính năng bảo mật nâng cao (2FA, email verification) để đơn giản hóa
- Sẵn sàng cho real-time messaging với WebSocket
- Phù hợp cho cả web application và desktop application (wrapped với Electron/Tauri)

---

**Status**: ✅ ALL ENTITIES AND REPOSITORIES CREATED SUCCESSFULLY - NO ERRORS
**Generated**: 2025-01-05
**Tech Stack**: Java 21 + Spring Boot 3.5.7 + JPA + MySQL + Lombok

