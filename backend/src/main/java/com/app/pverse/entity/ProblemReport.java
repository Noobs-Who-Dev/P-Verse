package com.app.pverse.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "problem_reports")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProblemReport {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(nullable = false)
    private String type; // bug, feature, account, content, other

    @Column(nullable = false, length = 200)
    private String subject;

    @Column(nullable = false, length = 2000)
    private String description;

    @Column(name = "screenshot_path")
    private String screenshotPath;

    @Column(name = "user_agent", length = 500)
    private String userAgent;

    @Column(name = "page_url", length = 500)
    private String pageUrl;

    @Column(nullable = false)
    private String status = "PENDING"; // PENDING, IN_PROGRESS, RESOLVED, CLOSED

    @Column(name = "admin_response", length = 2000)
    private String adminResponse;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "resolved_at")
    private LocalDateTime resolvedAt;
}

