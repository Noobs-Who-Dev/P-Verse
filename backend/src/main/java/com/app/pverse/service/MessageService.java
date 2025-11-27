package com.app.pverse.service;

import com.app.pverse.entity.Conversation;
import com.app.pverse.entity.Friendship;
import com.app.pverse.entity.Message;
import com.app.pverse.entity.Moment;
import com.app.pverse.entity.User;
import com.app.pverse.repository.ConversationRepository;
import com.app.pverse.repository.FriendshipRepository;
import com.app.pverse.repository.MessageRepository;
import com.app.pverse.repository.MomentRepository;
import com.app.pverse.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MessageService {

    private final ConversationRepository conversationRepository;
    private final MessageRepository messageRepository;
    private final FriendshipRepository friendshipRepository;
    private final UserRepository userRepository;
    private final MomentRepository momentRepository;

    /**
     * Gửi tin nhắn giữa hai người đã kết bạn.
     */
    @Transactional
    public Message sendMessage(Long senderId, Long receiverId, String content, String messageType) {
        System.out.println("\n📨 MessageService.sendMessage() called");
        System.out.println("   Sender ID: " + senderId);
        System.out.println("   Receiver ID: " + receiverId);
        System.out.println("   Content: " + content);
        System.out.println("   MessageType: " + messageType);

        if (senderId == null || receiverId == null)
            throw new IllegalArgumentException("senderId and receiverId cannot be null");

        if (senderId.equals(receiverId))
            throw new IllegalArgumentException("Cannot send message to yourself");

        System.out.println("🔍 Checking friendship status...");
        boolean areFriends = friendshipRepository.existsFriendshipBetweenUsers(
            senderId, receiverId, Friendship.FriendshipStatus.ACCEPTED);

        if (!areFriends) {
            System.out.println("❌ Users are not friends!");
            throw new IllegalStateException("Two users are not friends");
        }
        System.out.println("✅ Users are friends");

        // Find or create conversation
        System.out.println("🔍 Finding or creating conversation...");
        Conversation conversation = conversationRepository.findByUserPair(senderId, receiverId)
                .orElseGet(() -> {
                    System.out.println("   Creating new conversation...");
                    Long u1 = Math.min(senderId, receiverId);
                    Long u2 = Math.max(senderId, receiverId);
                    User user1 = userRepository.findById(u1)
                            .orElseThrow(() -> new IllegalArgumentException("User not found: " + u1));
                    User user2 = userRepository.findById(u2)
                            .orElseThrow(() -> new IllegalArgumentException("User not found: " + u2));

                    Conversation newConvo = Conversation.builder()
                            .user1(user1)
                            .user2(user2)
                            .createdAt(LocalDateTime.now())
                            .lastMessageAt(LocalDateTime.now())
                            .build();
                    Conversation savedConvo = conversationRepository.save(newConvo);
                    System.out.println("   ✅ New conversation created with ID: " + savedConvo.getId());
                    return savedConvo;
                });
        System.out.println("✅ Conversation ID: " + conversation.getId());

        System.out.println("🔍 Finding sender...");
        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new IllegalArgumentException("Sender not found"));
        System.out.println("✅ Sender found: " + sender.getUsername());

        System.out.println("🔨 Building message entity...");
        Message message = Message.builder()
                .conversation(conversation)
                .sender(sender)
                .messageType(Message.MessageType.valueOf(messageType != null ? messageType.toUpperCase() : "TEXT"))
                .content(content)
                .isRead(false)
                .createdAt(LocalDateTime.now())
                .build();

        System.out.println("💾 Saving message to database...");
        Message saved = messageRepository.save(message);
        System.out.println("✅ Message saved with ID: " + saved.getId());

        System.out.println("🔄 Updating conversation lastMessageAt...");
        conversation.setLastMessageAt(LocalDateTime.now());
        conversationRepository.save(conversation);
        System.out.println("✅ Conversation updated");

        System.out.println("✅ MessageService.sendMessage() completed successfully\n");
        return saved;
    }

    public Page<Message> getMessages(Long conversationId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").ascending());
        return messageRepository.findByConversationIdOrderByCreatedAtAsc(conversationId, pageable);
    }


    public List<Conversation> getUserConversations(Long userId) {
        return conversationRepository.findAllByUser(userId);
    }

    @Transactional
    public void markMessagesAsRead(Long conversationId, Long userId) {
        final int pageSize = 200; // có thể điều chỉnh theo nhu cầu
        int page = 0;

        Page<Message> pageResult;
        do {
            Pageable pageable = PageRequest.of(page, pageSize, Sort.by("createdAt").ascending());
            pageResult = messageRepository.findByConversationIdOrderByCreatedAtAsc(conversationId, pageable);

            List<Message> toUpdate = pageResult.getContent()
                    .stream()
                    .filter(m -> m.getSender() != null
                            && !m.getSender().getId().equals(userId)
                            && Boolean.FALSE.equals(m.getIsRead()))
                    .peek(m -> m.setIsRead(true))
                    .collect(Collectors.toList());

            if (!toUpdate.isEmpty()) {
                messageRepository.saveAll(toUpdate);
                // nếu muốn, có thể flush() để đảm bảo ghi ngay: entityManager.flush();
            }

            page++;
        } while (pageResult.hasNext());
    }

    /**
     * Gửi comment vào moment dưới dạng message với ảnh của moment đó
     * @param commenterId ID người comment
     * @param momentId ID của moment được comment
     * @param commentContent Nội dung comment
     * @return Message đã được lưu
     */
    @Transactional
    public Message sendCommentAsMessage(Long commenterId, Long momentId, String commentContent) {
        System.out.println("\n📝 MessageService.sendCommentAsMessage() called");
        System.out.println("   Commenter ID: " + commenterId);
        System.out.println("   Moment ID: " + momentId);
        System.out.println("   Comment: " + commentContent);

        if (commenterId == null || momentId == null) {
            throw new IllegalArgumentException("commenterId and momentId cannot be null");
        }

        if (commentContent == null || commentContent.isBlank()) {
            throw new IllegalArgumentException("Comment content cannot be empty");
        }

        // Tìm moment
        System.out.println("🔍 Finding moment...");
        Moment moment = momentRepository.findById(momentId)
                .orElseThrow(() -> new IllegalArgumentException("Moment not found: " + momentId));
        System.out.println("✅ Moment found, owner ID: " + moment.getUser().getId());

        Long momentOwnerId = moment.getUser().getId();

        // Không cho phép comment vào moment của chính mình
        if (commenterId.equals(momentOwnerId)) {
            throw new IllegalArgumentException("Cannot comment on your own moment");
        }

        // Kiểm tra friendship
        System.out.println("🔍 Checking friendship status...");
        boolean areFriends = friendshipRepository.existsFriendshipBetweenUsers(
                commenterId, momentOwnerId, Friendship.FriendshipStatus.ACCEPTED);

        if (!areFriends) {
            System.out.println("❌ Users are not friends!");
            throw new IllegalStateException("You must be friends to comment on moments");
        }
        System.out.println("✅ Users are friends");

        // Tìm hoặc tạo conversation
        System.out.println("🔍 Finding or creating conversation...");
        Conversation conversation = conversationRepository.findByUserPair(commenterId, momentOwnerId)
                .orElseGet(() -> {
                    System.out.println("   Creating new conversation...");
                    Long u1 = Math.min(commenterId, momentOwnerId);
                    Long u2 = Math.max(commenterId, momentOwnerId);
                    User user1 = userRepository.findById(u1)
                            .orElseThrow(() -> new IllegalArgumentException("User not found: " + u1));
                    User user2 = userRepository.findById(u2)
                            .orElseThrow(() -> new IllegalArgumentException("User not found: " + u2));

                    Conversation newConvo = Conversation.builder()
                            .user1(user1)
                            .user2(user2)
                            .createdAt(LocalDateTime.now())
                            .lastMessageAt(LocalDateTime.now())
                            .build();
                    Conversation savedConvo = conversationRepository.save(newConvo);
                    System.out.println("   ✅ New conversation created with ID: " + savedConvo.getId());
                    return savedConvo;
                });
        System.out.println("✅ Conversation ID: " + conversation.getId());

        // Tìm commenter
        System.out.println("🔍 Finding commenter...");
        User commenter = userRepository.findById(commenterId)
                .orElseThrow(() -> new IllegalArgumentException("Commenter not found"));
        System.out.println("✅ Commenter found: " + commenter.getUsername());

        // Tạo message với type MOMENT_REPLY
        System.out.println("🔨 Building MOMENT_REPLY message...");
        Message message = Message.builder()
                .conversation(conversation)
                .sender(commenter)
                .messageType(Message.MessageType.MOMENT_REPLY)
                .content(commentContent)
                .repliedMoment(moment)
                .isRead(false)
                .createdAt(LocalDateTime.now())
                .build();

        System.out.println("💾 Saving message to database...");
        Message saved = messageRepository.save(message);
        System.out.println("✅ Message saved with ID: " + saved.getId());

        // Update conversation
        System.out.println("🔄 Updating conversation lastMessageAt...");
        conversation.setLastMessageAt(LocalDateTime.now());
        conversationRepository.save(conversation);
        System.out.println("✅ Conversation updated");

        System.out.println("✅ MessageService.sendCommentAsMessage() completed successfully\n");
        return saved;
    }
}
