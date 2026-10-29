package com.agrisense.backend.dto;

import java.util.List;

public record DiseaseDetectionResponse(
        boolean success,
        String message,
        Long farmId,
        String predictedDisease,
        Double confidence,
        List<TopPrediction> topPredictions
) {
    public record TopPrediction(
            String disease,
            Double confidence
    ) {}
}