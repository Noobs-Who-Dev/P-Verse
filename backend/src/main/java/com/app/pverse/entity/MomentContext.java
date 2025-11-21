package com.app.pverse.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "moment_contexts",
    indexes = {
        @Index(name = "idx_context_type", columnList = "context_type")
    }
)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MomentContext {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(cascade = CascadeType.REMOVE)
    @JoinColumn(name = "moment_id", nullable = false, unique = true)
    private Moment moment;

    @Enumerated(EnumType.STRING)
    @Column(name = "context_type", length = 50)
    private ContextType contextType;

    @Column(name = "context_details")
    private String contextDetails;

    @Column(name = "app_name", length = 100)
    private String appName;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public enum ContextType {
        MUSIC, GAME, WORK, BROWSER, OTHER
    }

    /**
     * Validate context consistency:
     * Nếu có contextType thì phải có contextDetails và ngược lại
     */
    @PrePersist
    @PreUpdate
    public void validateContextConsistency() {
        boolean hasType = contextType != null;
        boolean hasDetails = contextDetails != null && !contextDetails.isBlank();

        if (hasType != hasDetails) {
            throw new IllegalStateException(
                "contextType and contextDetails must both be null or both be non-null"
            );
        }
    }
}
