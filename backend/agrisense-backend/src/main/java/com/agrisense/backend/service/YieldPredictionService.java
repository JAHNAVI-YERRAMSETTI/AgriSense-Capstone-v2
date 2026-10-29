package com.agrisense.backend.service;

import com.agrisense.backend.dto.YieldPredictionResponse;

public interface YieldPredictionService {

    YieldPredictionResponse predictYield(Long farmId);
}