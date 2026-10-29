package com.agrisense.backend.service;

import com.agrisense.backend.dto.CropRecommendationResponse;

public interface CropRecommendationService {

    CropRecommendationResponse recommendCrop(Long farmId);
}