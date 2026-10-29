
package com.agrisense.backend.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

import org.springframework.stereotype.Service;

import com.agrisense.backend.dto.ContextInterpretationResponse;
import com.agrisense.backend.dto.ContextInterpretationResponse.ContextItem;
import com.agrisense.backend.dto.RiskAnalysisResponse;
import com.agrisense.backend.dto.RiskAnalysisResponse.RiskFinding;

@Service
public class RiskAnalysisServiceImpl implements RiskAnalysisService {

    private final ContextInterpretationService contextInterpretationService;

    public RiskAnalysisServiceImpl(
            ContextInterpretationService contextInterpretationService) {
        this.contextInterpretationService = contextInterpretationService;
    }

    @Override
    public RiskAnalysisResponse analyzeFarmRisks(Long farmId) {

        ContextInterpretationResponse contextResponse =
                contextInterpretationService.interpretFarmContext(farmId);

        List<RiskFinding> risks = new ArrayList<>();

        if (contextResponse.context() == null
                || contextResponse.context().isEmpty()) {
            return new RiskAnalysisResponse(
                    true,
                    "No context findings are available for risk analysis.",
                    farmId,
                    contextResponse.crop(),
                    contextResponse.growthStage(),
                    "UNKNOWN",
                    risks
            );
        }

        boolean hasHigh = false;
        boolean hasMedium = false;
        boolean hasUnknown = false;

        for (ContextItem item : contextResponse.context()) {

            String severity = normalize(item.severity());

            if ("UNKNOWN".equals(severity)) {
                hasUnknown = true;
                risks.add(new RiskFinding(
                        item.category(),
                        item.parameter(),
                        item.value(),
                        "UNKNOWN",
                        item.interpretation(),
                        "INSUFFICIENT_DATA"
                ));
                continue;
            }

            if ("HIGH".equals(severity)) {
                hasHigh = true;
            } else if ("MEDIUM".equals(severity)) {
                hasMedium = true;
            } else if (!"LOW".equals(severity)
                    && !"INFO".equals(severity)) {
                hasUnknown = true;
                risks.add(new RiskFinding(
                        item.category(),
                        item.parameter(),
                        item.value(),
                        "UNKNOWN",
                        item.interpretation(),
                        "UNRECOGNIZED_SEVERITY"
                ));
                continue;
            }

            // LOW and INFO findings are retained as evidence,
            // but are not counted as elevated risks.
            if ("HIGH".equals(severity) || "MEDIUM".equals(severity)) {
                risks.add(new RiskFinding(
                        item.category(),
                        item.parameter(),
                        item.value(),
                        severity,
                        item.interpretation(),
                        "IDENTIFIED"
                ));
            }
        }

        String overallStatus;

        if (hasHigh) {
            overallStatus = "HIGH";
        } else if (hasMedium) {
            overallStatus = "MEDIUM";
        } else if (hasUnknown) {
            overallStatus = "UNKNOWN";
        } else {
            overallStatus = "LOW";
        }

        String message = switch (overallStatus) {
            case "HIGH" ->
                    "One or more context items have HIGH severity. Review the listed evidence.";
            case "MEDIUM" ->
                    "One or more context items have MEDIUM severity. Review the listed evidence.";
            case "UNKNOWN" ->
                    "Some context information is unavailable or insufficient.";
            default ->
                    "No elevated context severity was identified by the existing interpretation rules.";
        };

        return new RiskAnalysisResponse(
                contextResponse.success(),
                message,
                contextResponse.farmId(),
                contextResponse.crop(),
                contextResponse.growthStage(),
                overallStatus,
                risks
        );
    }

    private String normalize(String severity) {
        return severity == null
                ? "UNKNOWN"
                : severity.trim().toUpperCase(Locale.ROOT);
    }
}
