
package com.agrisense.backend.controller;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.agrisense.backend.dto.RiskAnalysisResponse;
import com.agrisense.backend.service.RiskAnalysisService;

@RestController
@RequestMapping("/predictionapi")
@CrossOrigin(origins = "*")
public class RiskAnalysisController {

    private final RiskAnalysisService riskAnalysisService;

    public RiskAnalysisController(
            RiskAnalysisService riskAnalysisService) {
        this.riskAnalysisService = riskAnalysisService;
    }

    @GetMapping("/risk-analysis/{farmId}")
    public RiskAnalysisResponse analyzeFarmRisks(
            @PathVariable Long farmId) {
        return riskAnalysisService.analyzeFarmRisks(farmId);
    }
}
