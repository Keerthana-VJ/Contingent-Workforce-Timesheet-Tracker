package com.contingentworkforce.dto.validation;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ValidationResult {
    private String status; // PASS, WARNING, REVIEW_REQUIRED, BLOCKED
    private Integer riskScore;
    private String riskLevel; // LOW, MEDIUM, HIGH, CRITICAL
    private List<TriggeredRule> rulesTriggered;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TriggeredRule {
        private String rule;
        private String severity;
        private String message;
    }
}