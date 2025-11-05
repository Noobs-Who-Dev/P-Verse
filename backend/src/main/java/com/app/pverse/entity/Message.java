package com.app.pverse.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "messages",
    indexes = {
        @Index(name = "idx_conversation_messages", columnList = "conversation_id, created_at"),
        @Index(name = "idx_sender_messages", columnList = "sender_id, created_at"),
        @Index(name = "idx_unread", columnList = "conversation_id, is_read")
    }
)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Message {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "conversation_id", nullable = false)
    private Conversation conversation;

    @ManyToOne
    @JoinColumn(name = "sender_id", nullable = false)
    private User sender;

    @Enumerated(EnumType.STRING)
    @Column(name = "message_type", length = 20, nullable = false)
    @Builder.Default
    private MessageType messageType = MessageType.TEXT;

    @Column(columnDefinition = "TEXT")
    private String content;

    @Column(name = "image_path")
    private String imagePath;

    @ManyToOne
    @JoinColumn(name = "replied_moment_id")
    private Moment repliedMoment;

    @Column(name = "is_read", nullable = false)
    @Builder.Default
    private Boolean isRead = false;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public enum MessageType {
        TEXT, IMAGE, MOMENT_REPLY
    }

    /**
     * Validate message constraints based on type
     */
    @PrePersist
    @PreUpdate
    public void validateMessageContent() {
        switch (messageType) {
            case TEXT:
                if (content == null || content.isBlank()) {
                    throw new IllegalStateException("TEXT message must have content");
                }
                if (content.length() > 1000) {
                    throw new IllegalStateException("TEXT message content cannot exceed 1000 characters");
                }
                break;

            case IMAGE:
                if (imagePath == null || imagePath.isBlank()) {
                    throw new IllegalStateException("IMAGE message must have imagePath");
                }
                break;

            case MOMENT_REPLY:
                if (repliedMoment == null) {
                    throw new IllegalStateException("MOMENT_REPLY message must have repliedMoment");
                }
                if (content == null || content.isBlank()) {
                    throw new IllegalStateException("MOMENT_REPLY message must have content");
                }
                break;
        }
    }
}

