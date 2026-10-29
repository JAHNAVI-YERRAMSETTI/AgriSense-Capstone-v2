package com.agrisense.backend.service;

import com.agrisense.backend.dto.FarmerResponse;
import com.agrisense.backend.dto.FarmerUpdateRequest;

public interface FarmerService {

    FarmerResponse getFarmerById(Long id);

    FarmerResponse updateFarmer(
            Long id,
            FarmerUpdateRequest request
    );
}