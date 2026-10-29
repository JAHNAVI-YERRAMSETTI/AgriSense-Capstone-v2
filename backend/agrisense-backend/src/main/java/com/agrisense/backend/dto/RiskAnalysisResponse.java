
package com.agrisense.backend.dto;

import java.util.List;

public record RiskAnalysisResponse(
        boolean success,
        String message,
        Long farmId,
        String crop,
        String growthStage,
        String overallStatus,
        List<RiskFinding> risks
) {

    public record RiskFinding(
            String category,
            String parameter,
            String value,
            String severity,
            String evidence,
            String status
    ) {}
}
