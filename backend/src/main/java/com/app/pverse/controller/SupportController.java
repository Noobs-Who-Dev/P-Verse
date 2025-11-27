package com.app.pverse.controller;

import com.app.pverse.dto.request.report.ReportProblemRequestDTO;
import com.app.pverse.entity.ProblemReport;
import com.app.pverse.entity.User;
import com.app.pverse.service.SupportService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/support")
@RequiredArgsConstructor
@Slf4j
public class SupportController {

    private final SupportService supportService;

    /**
     * Submit a problem report
     * POST /api/support/report
     * Accepts: application/json with optional multipart file
     */
    @PostMapping("/report")
    public ResponseEntity<?> submitReport(
            @RequestBody ReportProblemRequestDTO request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        try {
            // Get authenticated user ID from UserDetails
            User user = (User) userDetails;
            request.setUserId(user.getId());

            log.info("Received report submission from user {}: type={}, subject={}",
                    user.getId(), request.getType(), request.getSubject());

            // For now, submit without screenshot (frontend can be enhanced later)
            ProblemReport report = supportService.submitReport(request, null);

            log.info("Report saved successfully with ID: {}", report.getId());

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Report submitted successfully");
            response.put("reportId", report.getId());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Failed to submit report", e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Failed to submit report: " + e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    /**
     * Submit a problem report with screenshot (multipart)
     * POST /api/support/report-with-file
     */
    @PostMapping(value = "/report-with-file", consumes = "multipart/form-data")
    public ResponseEntity<?> submitReportWithFile(
            @RequestPart("type") String type,
            @RequestPart("subject") String subject,
            @RequestPart("description") String description,
            @RequestPart(value = "screenshot", required = false) MultipartFile screenshot,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        try {
            User user = (User) userDetails;

            // Create request object
            ReportProblemRequestDTO request = new ReportProblemRequestDTO();
            request.setUserId(user.getId());
            request.setType(type);
            request.setSubject(subject);
            request.setDescription(description);

            log.info("Received report with file from user {}: type={}, subject={}, hasFile={}",
                    user.getId(), type, subject, screenshot != null);

            ProblemReport report = supportService.submitReport(request, screenshot);

            log.info("Report with file saved successfully with ID: {}", report.getId());

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Report submitted successfully");
            response.put("reportId", report.getId());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Failed to submit report with file", e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Failed to submit report: " + e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    /**
     * Get user's problem reports
     * GET /api/support/my-reports
     */
    @GetMapping("/my-reports")
    public ResponseEntity<?> getMyReports(@AuthenticationPrincipal UserDetails userDetails) {
        try {
            User user = (User) userDetails;
            List<ProblemReport> reports = supportService.getUserReports(user.getId());
            return ResponseEntity.ok(reports);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to fetch reports: " + e.getMessage());
        }
    }

    /**
     * Get pending reports count
     * GET /api/support/pending-count
     */
    @GetMapping("/pending-count")
    public ResponseEntity<?> getPendingCount(@AuthenticationPrincipal UserDetails userDetails) {
        try {
            User user = (User) userDetails;
            long count = supportService.countPendingReportsByUser(user.getId());

            Map<String, Object> response = new HashMap<>();
            response.put("count", count);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to fetch count: " + e.getMessage());
        }
    }
}

