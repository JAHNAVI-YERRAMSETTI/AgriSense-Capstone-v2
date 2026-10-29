package com.agrisense.backend.service;

import com.agrisense.backend.dto.ContextInterpretationResponse;

public interface ContextInterpretationService {

    ContextInterpretationResponse interpretFarmContext(Long farmId);

}