package com.app.pverse.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "friendships",
    indexes = {
        @Index(name = "idx_user_status", columnList = "user_id, status"),
        @Index(name = "idx_friend_status", columnList = "friend_id, status")
    },
    uniqueConstraints = {
        @UniqueConstraint(name = "idx_friendship_pair", columnNames = {"user_id", "friend_id"})
    }
)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Friendship {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user; // Luôn là user ID nhỏ hơn

    @ManyToOne
    @JoinColumn(name = "friend_id", nullable = false)
    private User friend; // Luôn là user ID lớn hơn

    @Enumerated(EnumType.STRING)
    @Column(length = 20, nullable = false)
    @Builder.Default
    private FriendshipStatus status = FriendshipStatus.PENDING;

    @ManyToOne
    @JoinColumn(name = "requester_id", nullable = false)
    private User requester; // Ai là người gửi request

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public enum FriendshipStatus {
        PENDING, ACCEPTED, REJECTED, BLOCKED
    }

    /**
     * Đảm bảo userId luôn nhỏ hơn friendId trước khi persist
     */
    @PrePersist
    @PreUpdate
    public void validateUserOrder() {
        if (user.getId() >= friend.getId()) {
            throw new IllegalStateException("user_id must be less than friend_id");
        }
        if (user.getId().equals(friend.getId())) {
            throw new IllegalStateException("Cannot befriend yourself");
        }
        if (!requester.getId().equals(user.getId()) && !requester.getId().equals(friend.getId())) {
            throw new IllegalStateException("Requester must be one of the two users");
        }
    }
}

