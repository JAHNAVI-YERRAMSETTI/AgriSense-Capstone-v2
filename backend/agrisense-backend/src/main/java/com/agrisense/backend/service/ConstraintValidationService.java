package com.agrisense.backend.service;

import com.agrisense.backend.dto.ConstraintValidationRequest;
import com.agrisense.backend.dto.ConstraintValidationResponse;

public interface ConstraintValidationService {

    ConstraintValidationResponse validateAction(
            ConstraintValidationRequest request);
}