# TASK BREAKDOWN - P-VERSE CORE FEATURES

## 📋 Tổng Quan
File này liệt kê tất cả các Entity và Task cần thiết để xây dựng **6 tính năng CORE** của P-Verse.

**Dependency Tags:**
- `[P]` = Parallel (có thể làm song song với tất cả)
- `[D: X]` = Depends on Task X (phụ thuộc vào Task X)
- `[P with Y]` = Song song được với Task Y

---

## 🗂️ ENTITIES CẦN THIẾT (9 Entities)

### 1. User Entity
```java
@Entity
@Table(name = "users")
class User {
    - id: Long (PK)
    - username: String (unique)
    - email: String (unique)
    - password: String (BCrypt)
    - displayName: String
    - avatarUrl: String
    - bio: String
    - isOnline: Boolean
    - lastSeenAt: LocalDateTime
    - createdAt: LocalDateTime
    - updatedAt: LocalDateTime
}
```

### 2. UserSettings Entity
```java
@Entity
@Table(name = "user_settings")
class UserSettings {
    - id: Long (PK)
    - userId: Long (FK -> User)
    - theme: String (dark/light)
    - language: String (vi/en)
    - momentVisibility: String (all_friends/private)
    - notificationsEnabled: Boolean
    - createdAt: LocalDateTime
    - updatedAt: LocalDateTime
}
```

### 3. Friendship Entity
```java
@Entity
@Table(name = "friendships")
class Friendship {
    - id: Long (PK)
    - userId: Long (FK -> User)
    - friendId: Long (FK -> User)
    - status: String (pending/accepted/rejected)
    - createdAt: LocalDateTime
    - updatedAt: LocalDateTime
}
```

### 4. BlockedUser Entity (Optional)
```java
@Entity
@Table(name = "blocked_users")
class BlockedUser {
    - id: Long (PK)
    - blockerId: Long (FK -> User)
    - blockedId: Long (FK -> User)
    - createdAt: LocalDateTime
}
```

### 5. Moment Entity
```java
@Entity
@Table(name = "moments")
class Moment {
    - id: Long (PK)
    - userId: Long (FK -> User)
    - caption: String
    - imagePath: String
    - contextType: String (music/game/work/browser/other)
    - contextDetails: String
    - visibility: String (all_friends/private)
    - createdAt: LocalDateTime
}
```

### 6. MomentReaction Entity
```java
@Entity
@Table(name = "moment_reactions")
class MomentReaction {
    - id: Long (PK)
    - momentId: Long (FK -> Moment)
    - userId: Long (FK -> User)
    - reactionType: String (like/love/haha/wow/sad/angry)
    - createdAt: LocalDateTime
}
```

### 7. MomentComment Entity
```java
@Entity
@Table(name = "moment_comments")
class MomentComment {
    - id: Long (PK)
    - momentId: Long (FK -> Moment)
    - userId: Long (FK -> User)
    - content: String
    - createdAt: LocalDateTime
}
```

### 8. Conversation Entity
```java
@Entity
@Table(name = "conversations")
class Conversation {
    - id: Long (PK)
    - user1Id: Long (FK -> User)
    - user2Id: Long (FK -> User)
    - lastMessageAt: LocalDateTime
    - createdAt: LocalDateTime
}
```

### 9. Message Entity
```java
@Entity
@Table(name = "messages")
class Message {
    - id: Long (PK)
    - conversationId: Long (FK -> Conversation)
    - senderId: Long (FK -> User)
    - messageType: String (text/image/moment_share)
    - content: String
    - imagePath: String
    - sharedMomentId: Long (FK -> Moment, nullable)
    - isRead: Boolean
    - createdAt: LocalDateTime
}
```

---

## 📦 MODULE 1: DATABASE & CONFIGURATION

### Task 1.1: Setup MySQL Database `[P]`
**Description:** Cài đặt và cấu hình MySQL database

**Input:**
- MySQL installer
- Database credentials

**Output:**
- MySQL server running on localhost:3306
- Database `pverse_db` được tạo

**Steps:**
1. Install MySQL 8.0+
2. Create database: `CREATE DATABASE pverse_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
3. Create user: `CREATE USER 'pverse_user'@'localhost' IDENTIFIED BY 'password';`
4. Grant permissions: `GRANT ALL PRIVILEGES ON pverse_db.* TO 'pverse_user'@'localhost';`

---

### Task 1.2: Configure application.properties `[D: 1.1]`
**Description:** Cấu hình Spring Boot kết nối MySQL

**Input:**
- Database credentials từ Task 1.1

**Output:**
- File `backend/src/main/resources/application.properties` configured

**Content:**
```properties
spring.application.name=pverse
server.port=8080

# MySQL Configuration
spring.datasource.url=jdbc:mysql://localhost:3306/pverse_db?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
spring.datasource.username=pverse_user
spring.datasource.password=password
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

# JPA/Hibernate
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQL8Dialect
spring.jpa.properties.hibernate.format_sql=true

# File Upload
spring.servlet.multipart.max-file-size=10MB
spring.servlet.multipart.max-request-size=10MB
file.upload-dir=./data/uploads

# CORS
cors.allowed-origins=http://localhost:5173
```

---

### Task 1.3: Add Dependencies to pom.xml `[P]`
**Description:** Thêm các dependencies cần thiết cho Spring Boot project

**Input:**
- pom.xml file

**Output:**
- Updated pom.xml với đầy đủ dependencies

**Dependencies cần thêm:**
```xml
<!-- Spring Boot Starters -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
</dependency>
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-jpa</artifactId>
</dependency>
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-websocket</artifactId>
</dependency>
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-validation</artifactId>
</dependency>

<!-- MySQL Driver -->
<dependency>
    <groupId>com.mysql</groupId>
    <artifactId>mysql-connector-j</artifactId>
    <scope>runtime</scope>
</dependency>

<!-- Lombok -->
<dependency>
    <groupId>org.projectlombok</groupId>
    <artifactId>lombok</artifactId>
    <optional>true</optional>
</dependency>

<!-- Security (Basic) -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-security</artifactId>
</dependency>
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-api</artifactId>
    <version>0.11.5</version>
</dependency>
```

---

## 📦 MODULE 2: USER MANAGEMENT

### Task 2.1: Create User Entity `[D: 1.3]`
**Description:** Tạo JPA Entity cho User

**Input:**
- User entity specification (xem phần Entities)

**Output:**
- `backend/src/main/java/com/pverse/entity/User.java`

**Annotations:**
- @Entity, @Table, @Id, @GeneratedValue
- @Column với constraints (unique, nullable, length)
- @CreationTimestamp, @UpdateTimestamp
- Lombok: @Data, @NoArgsConstructor, @AllArgsConstructor

---

### Task 2.2: Create UserSettings Entity `[D: 2.1]`
**Description:** Tạo JPA Entity cho UserSettings

**Input:**
- UserSettings entity specification

**Output:**
- `backend/src/main/java/com/pverse/entity/UserSettings.java`

**Relationship:**
- @OneToOne with User (userId as FK)

---

### Task 2.3: Create User Repository `[D: 2.1]`
**Description:** Tạo JPA Repository cho User

**Input:**
- User entity

**Output:**
- `backend/src/main/java/com/pverse/repository/UserRepository.java`

**Methods:**
```java
interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    Optional<User> findByEmail(String email);
    Boolean existsByUsername(String username);
    Boolean existsByEmail(String email);
    List<User> findByIsOnline(Boolean isOnline);
}
```

---

### Task 2.4: Create UserSettings Repository `[D: 2.2]`
**Description:** Tạo JPA Repository cho UserSettings

**Input:**
- UserSettings entity

**Output:**
- `backend/src/main/java/com/pverse/repository/UserSettingsRepository.java`

**Methods:**
```java
interface UserSettingsRepository extends JpaRepository<UserSettings, Long> {
    Optional<UserSettings> findByUserId(Long userId);
}
```

---

### Task 2.5: Create Auth DTOs `[P with 2.1, 2.2, 2.3]`
**Description:** Tạo Data Transfer Objects cho Authentication

**Input:**
- API specification

**Output:**
- `backend/src/main/java/com/pverse/dto/`
  - `LoginRequest.java`
  - `RegisterRequest.java`
  - `AuthResponse.java`
  - `UserDto.java`

**LoginRequest:**
```java
{
    username: String (required)
    password: String (required)
}
```

**RegisterRequest:**
```java
{
    username: String (required, 3-50 chars)
    email: String (required, valid email)
    password: String (required, min 6 chars)
    displayName: String (required)
}
```

**AuthResponse:**
```java
{
    token: String
    user: UserDto
}
```

---

### Task 2.6: Create UserService `[D: 2.3, 2.4, 2.5]`
**Description:** Tạo Service layer cho User logic

**Input:**
- UserRepository, UserSettingsRepository
- Auth DTOs

**Output:**
- `backend/src/main/java/com/pverse/service/UserService.java`

**Methods:**
```java
class UserService {
    + registerUser(RegisterRequest): AuthResponse
    + loginUser(LoginRequest): AuthResponse
    + getUserById(Long): UserDto
    + updateUserProfile(Long, UserDto): UserDto
    + updateOnlineStatus(Long, Boolean): void
    + searchUsers(String): List<UserDto>
}
```

---

### Task 2.7: Create AuthController `[D: 2.6]`
**Description:** Tạo REST Controller cho Authentication

**Input:**
- UserService

**Output:**
- `backend/src/main/java/com/pverse/controller/AuthController.java`

**Endpoints:**
```
POST   /api/auth/register     -> register user
POST   /api/auth/login        -> login user
POST   /api/auth/logout       -> logout user
GET    /api/auth/me           -> get current user
```

---

### Task 2.8: Create UserController `[D: 2.6]`
**Description:** Tạo REST Controller cho User operations

**Input:**
- UserService

**Output:**
- `backend/src/main/java/com/pverse/controller/UserController.java`

**Endpoints:**
```
GET    /api/users/{id}           -> get user by id
PUT    /api/users/{id}           -> update user profile
GET    /api/users/search?q=      -> search users
PUT    /api/users/{id}/online    -> update online status
```

---

## 📦 MODULE 3: SOCIAL NETWORK (FRIENDSHIP)

### Task 3.1: Create Friendship Entity `[D: 2.1]`
**Description:** Tạo JPA Entity cho Friendship

**Input:**
- Friendship entity specification

**Output:**
- `backend/src/main/java/com/pverse/entity/Friendship.java`

**Relationships:**
- @ManyToOne with User (userId)
- @ManyToOne with User (friendId)

---

### Task 3.2: Create BlockedUser Entity `[D: 2.1]`
**Description:** Tạo JPA Entity cho BlockedUser (Optional)

**Input:**
- BlockedUser entity specification

**Output:**
- `backend/src/main/java/com/pverse/entity/BlockedUser.java`

---

### Task 3.3: Create Friendship Repository `[D: 3.1]`
**Description:** Tạo JPA Repository cho Friendship

**Input:**
- Friendship entity

**Output:**
- `backend/src/main/java/com/pverse/repository/FriendshipRepository.java`

**Methods:**
```java
interface FriendshipRepository extends JpaRepository<Friendship, Long> {
    List<Friendship> findByUserIdAndStatus(Long userId, String status);
    List<Friendship> findByFriendIdAndStatus(Long friendId, String status);
    Optional<Friendship> findByUserIdAndFriendId(Long userId, Long friendId);
    Boolean existsByUserIdAndFriendId(Long userId, Long friendId);
    
    @Query("SELECT f FROM Friendship f WHERE (f.userId = ?1 OR f.friendId = ?1) AND f.status = 'accepted'")
    List<Friendship> findAllFriendsByUserId(Long userId);
}
```

---

### Task 3.4: Create Friendship DTOs `[P with 3.1, 3.3]`
**Description:** Tạo DTOs cho Friendship operations

**Input:**
- API specification

**Output:**
- `backend/src/main/java/com/pverse/dto/`
  - `FriendRequestDto.java`
  - `FriendshipDto.java`

**FriendRequestDto:**
```java
{
    friendId: Long (required)
}
```

**FriendshipDto:**
```java
{
    id: Long
    user: UserDto
    friend: UserDto
    status: String
    createdAt: LocalDateTime
}
```

---

### Task 3.5: Create FriendService `[D: 3.3, 3.4]`
**Description:** Tạo Service layer cho Friendship logic

**Input:**
- FriendshipRepository, UserRepository
- Friendship DTOs

**Output:**
- `backend/src/main/java/com/pverse/service/FriendService.java`

**Methods:**
```java
class FriendService {
    + sendFriendRequest(Long userId, Long friendId): FriendshipDto
    + acceptFriendRequest(Long requestId): FriendshipDto
    + rejectFriendRequest(Long requestId): void
    + removeFriend(Long userId, Long friendId): void
    + getFriendRequests(Long userId): List<FriendshipDto>
    + getFriends(Long userId): List<UserDto>
    + checkFriendship(Long userId, Long friendId): String
}
```

---

### Task 3.6: Create FriendController `[D: 3.5]`
**Description:** Tạo REST Controller cho Friendship

**Input:**
- FriendService

**Output:**
- `backend/src/main/java/com/pverse/controller/FriendController.java`

**Endpoints:**
```
POST   /api/friends/request       -> send friend request
POST   /api/friends/{id}/accept   -> accept friend request
POST   /api/friends/{id}/reject   -> reject friend request
DELETE /api/friends/{friendId}    -> remove friend
GET    /api/friends               -> get friends list
GET    /api/friends/requests      -> get pending requests
GET    /api/friends/check/{id}    -> check friendship status
```

---

## 📦 MODULE 4: MOMENTS (POSTS)

### Task 4.1: Create Moment Entity `[D: 2.1]`
**Description:** Tạo JPA Entity cho Moment

**Input:**
- Moment entity specification

**Output:**
- `backend/src/main/java/com/pverse/entity/Moment.java`

**Relationships:**
- @ManyToOne with User (userId)

---

### Task 4.2: Create MomentReaction Entity `[D: 4.1]`
**Description:** Tạo JPA Entity cho MomentReaction

**Input:**
- MomentReaction entity specification

**Output:**
- `backend/src/main/java/com/pverse/entity/MomentReaction.java`

**Relationships:**
- @ManyToOne with Moment (momentId)
- @ManyToOne with User (userId)

---

### Task 4.3: Create MomentComment Entity `[D: 4.1]`
**Description:** Tạo JPA Entity cho MomentComment

**Input:**
- MomentComment entity specification

**Output:**
- `backend/src/main/java/com/pverse/entity/MomentComment.java`

**Relationships:**
- @ManyToOne with Moment (momentId)
- @ManyToOne with User (userId)

---

### Task 4.4: Create Moment Repository `[D: 4.1]`
**Description:** Tạo JPA Repository cho Moment

**Input:**
- Moment entity

**Output:**
- `backend/src/main/java/com/pverse/repository/MomentRepository.java`

**Methods:**
```java
interface MomentRepository extends JpaRepository<Moment, Long> {
    List<Moment> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<Moment> findByUserIdInOrderByCreatedAtDesc(List<Long> userIds, Pageable pageable);
    
    @Query("SELECT m FROM Moment m WHERE m.userId IN " +
           "(SELECT f.friendId FROM Friendship f WHERE f.userId = ?1 AND f.status = 'accepted') " +
           "AND m.visibility = 'all_friends' ORDER BY m.createdAt DESC")
    Page<Moment> findFriendsMoments(Long userId, Pageable pageable);
}
```

---

### Task 4.5: Create MomentReaction Repository `[D: 4.2]`
**Description:** Tạo JPA Repository cho MomentReaction

**Input:**
- MomentReaction entity

**Output:**
- `backend/src/main/java/com/pverse/repository/MomentReactionRepository.java`

**Methods:**
```java
interface MomentReactionRepository extends JpaRepository<MomentReaction, Long> {
    Optional<MomentReaction> findByMomentIdAndUserId(Long momentId, Long userId);
    List<MomentReaction> findByMomentId(Long momentId);
    Long countByMomentId(Long momentId);
    void deleteByMomentIdAndUserId(Long momentId, Long userId);
}
```

---

### Task 4.6: Create MomentComment Repository `[D: 4.3]`
**Description:** Tạo JPA Repository cho MomentComment

**Input:**
- MomentComment entity

**Output:**
- `backend/src/main/java/com/pverse/repository/MomentCommentRepository.java`

**Methods:**
```java
interface MomentCommentRepository extends JpaRepository<MomentComment, Long> {
    List<MomentComment> findByMomentIdOrderByCreatedAtAsc(Long momentId);
    Long countByMomentId(Long momentId);
}
```

---

### Task 4.7: Create Moment DTOs `[P with 4.1-4.6]`
**Description:** Tạo DTOs cho Moment operations

**Input:**
- API specification

**Output:**
- `backend/src/main/java/com/pverse/dto/`
  - `CreateMomentRequest.java`
  - `MomentDto.java`
  - `ReactionDto.java`
  - `CommentDto.java`

**CreateMomentRequest:**
```java
{
    caption: String
    imagePath: String (required)
    contextType: String (optional)
    contextDetails: String (optional)
    visibility: String (default: all_friends)
}
```

**MomentDto:**
```java
{
    id: Long
    user: UserDto
    caption: String
    imagePath: String
    contextType: String
    contextDetails: String
    visibility: String
    reactionCount: Long
    commentCount: Long
    myReaction: String (nullable)
    createdAt: LocalDateTime
}
```

---

### Task 4.8: Create FileStorageService `[P]`
**Description:** Tạo Service để handle file upload/download

**Input:**
- Upload directory path

**Output:**
- `backend/src/main/java/com/pverse/service/FileStorageService.java`

**Methods:**
```java
class FileStorageService {
    + storeFile(MultipartFile, String type): String
    + loadFile(String filename): Resource
    + deleteFile(String filename): void
    + getFileUrl(String filename): String
}
```

---

### Task 4.9: Create MomentService `[D: 4.4, 4.5, 4.6, 4.7, 4.8]`
**Description:** Tạo Service layer cho Moment logic

**Input:**
- MomentRepository, ReactionRepository, CommentRepository
- FileStorageService, UserRepository

**Output:**
- `backend/src/main/java/com/pverse/service/MomentService.java`

**Methods:**
```java
class MomentService {
    + createMoment(Long userId, CreateMomentRequest, MultipartFile): MomentDto
    + getMomentById(Long momentId): MomentDto
    + getUserMoments(Long userId): List<MomentDto>
    + getFriendsFeed(Long userId, int page, int size): Page<MomentDto>
    + deleteMoment(Long momentId, Long userId): void
    
    // Reactions
    + addReaction(Long momentId, Long userId, String reactionType): void
    + removeReaction(Long momentId, Long userId): void
    + getReactions(Long momentId): List<ReactionDto>
    
    // Comments
    + addComment(Long momentId, Long userId, String content): CommentDto
    + getComments(Long momentId): List<CommentDto>
    + deleteComment(Long commentId, Long userId): void
}
```

---

### Task 4.10: Create MomentController `[D: 4.9]`
**Description:** Tạo REST Controller cho Moment

**Input:**
- MomentService

**Output:**
- `backend/src/main/java/com/pverse/controller/MomentController.java`

**Endpoints:**
```
POST   /api/moments                    -> create moment (with file upload)
GET    /api/moments/{id}               -> get moment by id
GET    /api/moments/user/{userId}      -> get user's moments
GET    /api/moments/feed               -> get friends feed
DELETE /api/moments/{id}               -> delete moment

POST   /api/moments/{id}/reactions     -> add reaction
DELETE /api/moments/{id}/reactions     -> remove reaction
GET    /api/moments/{id}/reactions     -> get reactions

POST   /api/moments/{id}/comments      -> add comment
GET    /api/moments/{id}/comments      -> get comments
DELETE /api/comments/{id}              -> delete comment
```

---

## 📦 MODULE 5: MESSAGING

### Task 5.1: Create Conversation Entity `[D: 2.1]`
**Description:** Tạo JPA Entity cho Conversation

**Input:**
- Conversation entity specification

**Output:**
- `backend/src/main/java/com/pverse/entity/Conversation.java`

**Relationships:**
- @ManyToOne with User (user1Id)
- @ManyToOne with User (user2Id)

---

### Task 5.2: Create Message Entity `[D: 5.1, 4.1]`
**Description:** Tạo JPA Entity cho Message

**Input:**
- Message entity specification

**Output:**
- `backend/src/main/java/com/pverse/entity/Message.java`

**Relationships:**
- @ManyToOne with Conversation (conversationId)
- @ManyToOne with User (senderId)
- @ManyToOne with Moment (sharedMomentId, optional)

---

### Task 5.3: Create Conversation Repository `[D: 5.1]`
**Description:** Tạo JPA Repository cho Conversation

**Input:**
- Conversation entity

**Output:**
- `backend/src/main/java/com/pverse/repository/ConversationRepository.java`

**Methods:**
```java
interface ConversationRepository extends JpaRepository<Conversation, Long> {
    @Query("SELECT c FROM Conversation c WHERE " +
           "(c.user1Id = ?1 AND c.user2Id = ?2) OR " +
           "(c.user1Id = ?2 AND c.user2Id = ?1)")
    Optional<Conversation> findByUsers(Long userId1, Long userId2);
    
    @Query("SELECT c FROM Conversation c WHERE " +
           "c.user1Id = ?1 OR c.user2Id = ?1 " +
           "ORDER BY c.lastMessageAt DESC")
    List<Conversation> findByUserId(Long userId);
}
```

---

### Task 5.4: Create Message Repository `[D: 5.2]`
**Description:** Tạo JPA Repository cho Message

**Input:**
- Message entity

**Output:**
- `backend/src/main/java/com/pverse/repository/MessageRepository.java`

**Methods:**
```java
interface MessageRepository extends JpaRepository<Message, Long> {
    List<Message> findByConversationIdOrderByCreatedAtDesc(Long conversationId, Pageable pageable);
    Long countByConversationIdAndSenderIdNotAndIsReadFalse(Long conversationId, Long userId);
    List<Message> findByConversationIdAndSenderIdNotAndIsReadFalse(Long conversationId, Long userId);
}
```

---

### Task 5.5: Create Message DTOs `[P with 5.1-5.4]`
**Description:** Tạo DTOs cho Messaging operations

**Input:**
- API specification

**Output:**
- `backend/src/main/java/com/pverse/dto/`
  - `SendMessageRequest.java`
  - `MessageDto.java`
  - `ConversationDto.java`

**SendMessageRequest:**
```java
{
    receiverId: Long (required)
    messageType: String (text/image/moment_share)
    content: String (required for text)
    sharedMomentId: Long (required for moment_share)
}
```

**MessageDto:**
```java
{
    id: Long
    conversationId: Long
    sender: UserDto
    messageType: String
    content: String
    imagePath: String
    sharedMoment: MomentDto
    isRead: Boolean
    createdAt: LocalDateTime
}
```

**ConversationDto:**
```java
{
    id: Long
    otherUser: UserDto
    lastMessage: MessageDto
    unreadCount: Long
    lastMessageAt: LocalDateTime
}
```

---

### Task 5.6: Create MessageService `[D: 5.3, 5.4, 5.5]`
**Description:** Tạo Service layer cho Messaging logic

**Input:**
- ConversationRepository, MessageRepository
- UserRepository, FileStorageService

**Output:**
- `backend/src/main/java/com/pverse/service/MessageService.java`

**Methods:**
```java
class MessageService {
    + sendMessage(Long senderId, SendMessageRequest): MessageDto
    + getConversations(Long userId): List<ConversationDto>
    + getMessages(Long conversationId, Long userId, int page, int size): Page<MessageDto>
    + markAsRead(Long conversationId, Long userId): void
    + deleteMessage(Long messageId, Long userId): void
    + getOrCreateConversation(Long user1Id, Long user2Id): Conversation
}
```

---

### Task 5.7: Create MessageController `[D: 5.6]`
**Description:** Tạo REST Controller cho Messaging

**Input:**
- MessageService

**Output:**
- `backend/src/main/java/com/pverse/controller/MessageController.java`

**Endpoints:**
```
POST   /api/messages                          -> send message
GET    /api/conversations                     -> get conversations
GET    /api/conversations/{id}/messages       -> get messages in conversation
PUT    /api/conversations/{id}/read           -> mark as read
DELETE /api/messages/{id}                     -> delete message
```

---

## 📦 MODULE 6: WEBSOCKET (REAL-TIME)

### Task 6.1: Create WebSocketConfig `[P]`
**Description:** Cấu hình WebSocket với SockJS và STOMP

**Input:**
- WebSocket specification

**Output:**
- `backend/src/main/java/com/pverse/config/WebSocketConfig.java`

**Configuration:**
```java
@Configuration
@EnableWebSocketMessageBroker
class WebSocketConfig implements WebSocketMessageBrokerConfigurer {
    + configureMessageBroker(MessageBrokerRegistry)
    + registerStompEndpoints(StompEndpointRegistry)
}
```

**Endpoints:**
- `/ws` - WebSocket connection endpoint
- `/topic` - Broadcast messages
- `/queue` - Private messages

---

### Task 6.2: Create WebSocket DTOs `[P]`
**Description:** Tạo DTOs cho WebSocket messages

**Input:**
- WebSocket specification

**Output:**
- `backend/src/main/java/com/pverse/dto/`
  - `WebSocketMessage.java`
  - `NotificationMessage.java`

**WebSocketMessage:**
```java
{
    type: String (MESSAGE/REACTION/COMMENT/FRIEND_REQUEST/USER_ONLINE)
    senderId: Long
    receiverId: Long
    content: Object
    timestamp: LocalDateTime
}
```

---

### Task 6.3: Integrate WebSocket in MessageService `[D: 5.6, 6.1, 6.2]`
**Description:** Thêm WebSocket notification khi có tin nhắn mới

**Input:**
- MessageService
- SimpMessagingTemplate

**Output:**
- Updated MessageService với WebSocket support

**Changes:**
```java
class MessageService {
    @Autowired
    private SimpMessagingTemplate messagingTemplate;
    
    public MessageDto sendMessage(...) {
        // ... existing code ...
        
        // Send WebSocket notification
        messagingTemplate.convertAndSendToUser(
            receiverId.toString(),
            "/queue/messages",
            messageDto
        );
        
        return messageDto;
    }
}
```

---

### Task 6.4: Integrate WebSocket in FriendService `[D: 3.5, 6.1, 6.2]`
**Description:** Thêm WebSocket notification cho friend requests

**Input:**
- FriendService
- SimpMessagingTemplate

**Output:**
- Updated FriendService với WebSocket support

---

### Task 6.5: Create WebSocket Controller `[D: 6.1]`
**Description:** Tạo Controller để handle WebSocket messages

**Input:**
- WebSocketConfig

**Output:**
- `backend/src/main/java/com/pverse/controller/WebSocketController.java`

**Endpoints:**
```java
@MessageMapping("/chat.send")
@SendToUser("/queue/messages")
public MessageDto sendMessage(...)

@MessageMapping("/user.status")
@SendTo("/topic/status")
public UserStatusMessage updateStatus(...)
```

---

## 📦 MODULE 7: SECURITY & CONFIGURATION

### Task 7.1: Create SecurityConfig `[P]`
**Description:** Cấu hình Spring Security (Basic)

**Input:**
- Security requirements

**Output:**
- `backend/src/main/java/com/pverse/config/SecurityConfig.java`

**Configuration:**
- CORS enabled
- CSRF disabled (for development)
- HTTP Basic Authentication
- Public endpoints: /api/auth/**, /ws/**

---

### Task 7.2: Create CorsConfig `[P]`
**Description:** Cấu hình CORS để frontend có thể gọi API

**Input:**
- Frontend URL (http://localhost:5173)

**Output:**
- `backend/src/main/java/com/pverse/config/CorsConfig.java`

**Configuration:**
- Allowed origins: http://localhost:5173
- Allowed methods: GET, POST, PUT, DELETE
- Allowed headers: *
- Allow credentials: true

---

### Task 7.3: Create Global Exception Handler `[P]`
**Description:** Tạo global exception handler

**Input:**
- Common exceptions

**Output:**
- `backend/src/main/java/com/pverse/exception/GlobalExceptionHandler.java`

**Handles:**
- ResourceNotFoundException
- BadRequestException
- UnauthorizedException
- ValidationException

---

## 🎨 MODULE 8: FRONTEND SETUP

### Task 8.1: Initialize React + Vite Project `[P]`
**Description:** Khởi tạo React project với Vite

**Input:**
- Node.js installed

**Output:**
- `frontend/` folder với Vite + React configured

**Commands:**
```bash
npm create vite@latest frontend -- --template react
cd frontend
npm install
```

---

### Task 8.2: Install Frontend Dependencies `[D: 8.1]`
**Description:** Cài đặt các thư viện cần thiết

**Input:**
- package.json

**Output:**
- Updated package.json với dependencies

**Dependencies:**
```bash
npm install axios react-router-dom zustand
npm install sockjs-client @stomp/stompjs
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

---

### Task 8.3: Configure TailwindCSS `[D: 8.2]`
**Description:** Cấu hình TailwindCSS

**Input:**
- tailwind.config.js

**Output:**
- Configured TailwindCSS

---

### Task 8.4: Create API Service `[D: 8.2]`
**Description:** Tạo Axios instance và API services

**Input:**
- Backend API endpoints

**Output:**
- `frontend/src/services/`
  - `api.js` - Axios instance
  - `authService.js`
  - `momentService.js`
  - `friendService.js`
  - `messageService.js`

---

### Task 8.5: Create WebSocket Service `[D: 8.2]`
**Description:** Tạo WebSocket service với SockJS và STOMP

**Input:**
- WebSocket endpoint

**Output:**
- `frontend/src/services/websocket.js`

---

### Task 8.6: Create Zustand Stores `[D: 8.2]`
**Description:** Tạo state management với Zustand

**Input:**
- State requirements

**Output:**
- `frontend/src/store/`
  - `authStore.js` - User authentication
  - `momentStore.js` - Moments/Feed
  - `messageStore.js` - Messages
  - `friendStore.js` - Friends

---

## 📊 TASK SUMMARY & DEPENDENCIES

### Critical Path (Phải làm tuần tự):
1. Task 1.1 → Task 1.2 → Task 1.3
2. Task 2.1 → Task 2.3 → Task 2.6 → Task 2.7
3. Task 3.1 → Task 3.3 → Task 3.5 → Task 3.6
4. Task 4.1 → Task 4.4 → Task 4.9 → Task 4.10
5. Task 5.1 → Task 5.3 → Task 5.6 → Task 5.7

### Parallel Groups (Có thể làm song song):
**Group A - Database Setup:**
- Task 1.1, 1.3

**Group B - Entities (sau khi có User):**
- Task 2.2, 3.1, 3.2, 4.1

**Group C - Services:**
- Task 4.8, 7.1, 7.2, 7.3

**Group D - Frontend:**
- Task 8.1 → 8.2 → (8.3, 8.4, 8.5, 8.6 parallel)

**Group E - WebSocket:**
- Task 6.1, 6.2 (parallel với các tasks khác)
- Task 6.3, 6.4 (sau khi có services tương ứng)

---

## 📈 DEVELOPMENT TIMELINE (Suggested)

### Phase 1: Foundation (Week 1)
- Module 1: Database & Configuration
- Module 2: User Management (Tasks 2.1-2.4)
- Module 7: Security Config (Tasks 7.1-7.2)

### Phase 2: Core Features (Week 2)
- Module 2: Complete User Management (Tasks 2.5-2.8)
- Module 3: Social Network (Tasks 3.1-3.6)
- Module 8: Frontend Setup (Tasks 8.1-8.3)

### Phase 3: Content Sharing (Week 3)
- Module 4: Moments (Tasks 4.1-4.10)
- Module 8: Frontend Services (Tasks 8.4-8.6)

### Phase 4: Communication (Week 4)
- Module 5: Messaging (Tasks 5.1-5.7)
- Module 6: WebSocket (Tasks 6.1-6.5)

### Phase 5: Integration & Testing (Week 5)
- Integration testing
- Bug fixes
- Performance optimization

---

## ✅ COMPLETION CHECKLIST

### Backend
- [ ] 9 Entities created
- [ ] 9 Repositories created
- [ ] 5 Services created
- [ ] 5 Controllers created
- [ ] WebSocket configured
- [ ] Security configured
- [ ] Exception handling

### Frontend
- [ ] React + Vite setup
- [ ] TailwindCSS configured
- [ ] API services created
- [ ] WebSocket service created
- [ ] State management (Zustand)
- [ ] Basic UI components

### Integration
- [ ] Authentication flow working
- [ ] Friend requests working
- [ ] Moments creation & feed working
- [ ] Reactions & comments working
- [ ] Messaging working
- [ ] Real-time notifications working

---

**Total Tasks:** 60+ tasks
**Estimated Time:** 4-5 weeks (4 developers)
**Priority:** Core features first, then nice-to-have features

