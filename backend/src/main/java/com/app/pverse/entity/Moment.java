package com.app.pverse.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "moments",
        indexes = {
                @Index(name = "idx_user_created", columnList = "user_id, created_at"),
                @Index(name = "idx_created_at", columnList = "created_at"),
                @Index(name = "idx_specific_user", columnList = "specific_user_id, created_at")
        }
)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Moment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(columnDefinition = "TEXT")
    private String caption;

    @Column(name = "image_path", nullable = false)
    private String imagePath;

    @Enumerated(EnumType.STRING)
    @Column(length = 20, nullable = false)
    @Builder.Default
    private Visibility visibility = Visibility.ALL_FRIENDS;

    /**
     * Chỉ sử dụng khi visibility = SPECIFIC_PERSON
     * Nullable for other visibility types
     */
    @ManyToOne
    @JoinColumn(name = "specific_user_id")
    private User specificUser;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public enum Visibility {
        ALL_FRIENDS,      // Share với tất cả friends
        PRIVATE,          // Chỉ mình owner xem được
        SPECIFIC_PERSON   // Share với 1 người cụ thể (specificUser)
    }

    /**
     * Validate business rule: SPECIFIC_PERSON phải có specificUser
     */
    @PrePersist
    @PreUpdate
    private void validateVisibility() {
        if (visibility == Visibility.SPECIFIC_PERSON && specificUser == null) {
            throw new IllegalStateException(
                    "specificUser must not be null when visibility is SPECIFIC_PERSON"
            );
        }
        if (visibility != Visibility.SPECIFIC_PERSON && specificUser != null) {
            throw new IllegalStateException(
                    "specificUser must be null when visibility is not SPECIFIC_PERSON"
            );
        }
    }
}