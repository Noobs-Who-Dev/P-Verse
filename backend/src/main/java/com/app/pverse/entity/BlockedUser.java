package com.app.pverse.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "blocked_users",
    uniqueConstraints = {
        @UniqueConstraint(name = "idx_block_pair", columnNames = {"blocker_id", "blocked_id"})
    }
)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BlockedUser {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "blocker_id", nullable = false)
    private User blocker;

    @ManyToOne
    @JoinColumn(name = "blocked_id", nullable = false)
    private User blocked;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    /**
     * Validate không thể block chính mình
     */
    @PrePersist
    @PreUpdate
    public void validateNotSelfBlock() {
        if (blocker.getId().equals(blocked.getId())) {
            throw new IllegalStateException("Cannot block yourself");
        }
    }
}

