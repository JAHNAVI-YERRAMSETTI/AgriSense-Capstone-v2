
package com.agrisense.backend.service;

import com.agrisense.backend.dto.RiskAnalysisResponse;

public interface RiskAnalysisService {

    RiskAnalysisResponse analyzeFarmRisks(Long farmId);

}
