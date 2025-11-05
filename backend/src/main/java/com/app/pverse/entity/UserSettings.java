package com.app.pverse.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "user_settings", indexes = {
    @Index(name = "idx_user", columnList = "user_id")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserSettings {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    // ✅ CORE settings (MVP Phase 1)
    @Column(length = 20, nullable = false)
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private Theme theme = Theme.DARK;

    @Column(length = 10, nullable = false)
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private Language language = Language.VI;

    @Column(name = "notifications_enabled", nullable = false)
    @Builder.Default
    private Boolean notificationsEnabled = true;

    // ⚠️ FUTURE settings (Phase 2+) - Stored as JSON
    @Column(name = "extended_settings", columnDefinition = "JSON")
    private String extendedSettings;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Enums
    public enum Theme {
        DARK, LIGHT, AUTO
    }

    public enum Language {
        VI, EN
    }
}

