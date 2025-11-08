package com.app.pverse.services;

import com.app.pverse.entity.Conversation;
import com.app.pverse.entity.Message;
import com.app.pverse.entity.User;
import com.app.pverse.repository.ConversationRepository;
import com.app.pverse.repository.FriendshipRepository;
import com.app.pverse.repository.MessageRepository;
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

    /**
     * Gửi tin nhắn giữa hai người đã kết bạn.
     */
    @Transactional
    public Message sendMessage(Long senderId, Long receiverId, String content, String messageType) {
        if (senderId == null || receiverId == null)
            throw new IllegalArgumentException("senderId and receiverId cannot be null");

        if (senderId.equals(receiverId))
            throw new IllegalArgumentException("Cannot send message to yourself");

        boolean areFriends = friendshipRepository.existsByUserIdAndFriendIdAndStatus(senderId, receiverId, "accepted")
                || friendshipRepository.existsByUserIdAndFriendIdAndStatus(receiverId, senderId, "accepted");

        if (!areFriends)
            throw new IllegalStateException("Two users are not friends");

        // Find or create conversation
        Conversation conversation = conversationRepository.findByUserPair(senderId, receiverId)
                .orElseGet(() -> {
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
                    return conversationRepository.save(newConvo);
                });

        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new IllegalArgumentException("Sender not found"));

        Message message = Message.builder()
                .conversation(conversation)
                .sender(sender)
                .messageType(Message.MessageType.valueOf(messageType != null ? messageType : "text"))
                .content(content)
                .isRead(false)
                .createdAt(LocalDateTime.now())
                .build();

        Message saved = messageRepository.save(message);

        conversation.setLastMessageAt(LocalDateTime.now());
        conversationRepository.save(conversation);

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
}
