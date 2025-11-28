package com.app.pverse.service;

import com.app.pverse.dto.request.report.ReportProblemRequestDTO;
import com.app.pverse.entity.ProblemReport;
import com.app.pverse.entity.User;
import com.app.pverse.repository.ProblemReportRepository;
import com.app.pverse.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class SupportService {

    private final ProblemReportRepository problemReportRepository;
    private final UserRepository userRepository;
    private final FileStorageService fileStorageService;

    @Transactional
    public ProblemReport submitReport(ReportProblemRequestDTO request, MultipartFile screenshot) {
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        ProblemReport report = new ProblemReport();
        report.setUser(user);
        report.setType(request.getType());
        report.setSubject(request.getSubject());
        report.setDescription(request.getDescription());
        report.setUserAgent(request.getUserAgent());
        report.setPageUrl(request.getPageUrl());
        report.setStatus("PENDING");

        // Save screenshot if provided
        if (screenshot != null && !screenshot.isEmpty()) {
            try {
                // Use savePostImage as workaround, or we can create a new public method
                String screenshotPath = fileStorageService.savePostImage(screenshot, user.getId());
                report.setScreenshotPath(screenshotPath);
            } catch (Exception e) {
                log.error("Failed to save screenshot for report", e);
                // Continue without screenshot
            }
        }

        ProblemReport savedReport = problemReportRepository.save(report);

        log.info("Problem report submitted: ID={}, User={}, Type={}",
                savedReport.getId(), user.getUsername(), request.getType());

        // TODO: Send notification email to support team
        // emailService.sendReportNotification(savedReport);

        return savedReport;
    }

    public List<ProblemReport> getUserReports(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return problemReportRepository.findByUserOrderByCreatedAtDesc(user);
    }

    public long countPendingReportsByUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return problemReportRepository.countByUserAndStatus(user, "PENDING");
    }
}

