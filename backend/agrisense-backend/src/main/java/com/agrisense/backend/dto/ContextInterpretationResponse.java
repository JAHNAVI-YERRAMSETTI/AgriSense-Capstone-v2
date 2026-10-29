package com.agrisense.backend.dto;

import java.util.List;

public record ContextInterpretationResponse(
        boolean success,
        String message,
        Long farmId,
        String crop,
        String growthStage,
        List<ContextItem> context
) {

    public record ContextItem(
            String category,
            String parameter,
            String value,
            String interpretation,
            String severity
    ) {}
}