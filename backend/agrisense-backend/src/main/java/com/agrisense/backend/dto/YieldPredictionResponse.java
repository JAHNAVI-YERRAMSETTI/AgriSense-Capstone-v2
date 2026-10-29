package com.agrisense.backend.dto;

public record YieldPredictionResponse(
        boolean success,
        String message,
        Long farmId,
        String crop,
        String district,
        Double area,
        Double predictedYieldKgPerHa
) {
}