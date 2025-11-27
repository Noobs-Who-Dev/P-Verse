package com.app.pverse.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "conversations",
    indexes = {
        @Index(name = "idx_last_message", columnList = "last_message_at")
    },
    uniqueConstraints = {
        @UniqueConstraint(name = "idx_conversation_users", columnNames = {"user1_id", "user2_id"})
    }
)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Conversation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user1_id", nullable = false)
    private User user1; // Đơn giản: lưu 2 user trong 1 record (user1_id < user2_id)

    @ManyToOne
    @JoinColumn(name = "user2_id", nullable = false)
    private User user2;

    @Column(name = "last_message", length = 500)
    private String lastMessage;

    @Column(name = "last_message_sender_id")
    private Long lastMessageSenderId;

    @Column(name = "last_message_at")
    private LocalDateTime lastMessageAt;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    /**
     * Đảm bảo user1_id luôn nhỏ hơn user2_id để tránh duplicate conversation
     */
    @PrePersist
    @PreUpdate
    public void validateUserOrder() {
        if (user1.getId() >= user2.getId()) {
            throw new IllegalStateException("user1_id must be less than user2_id");
        }
    }

    /**
     * Helper method để lấy người dùng kia (the other user) trong conversation
     */
    public User getOtherUser(Long currentUserId) {
        if (user1.getId().equals(currentUserId)) {
            return user2;
        } else if (user2.getId().equals(currentUserId)) {
            return user1;
        }
        throw new IllegalArgumentException("Current user is not part of this conversation");
    }
}

