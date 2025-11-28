package com.app.pverse.dto.request.report;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReportProblemRequestDTO {
    private Long userId;
    private String type; // bug, feature, account, content, other
    private String subject;
    private String description;
    private String userAgent;
    private String pageUrl;
}

