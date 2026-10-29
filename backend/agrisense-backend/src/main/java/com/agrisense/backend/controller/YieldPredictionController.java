package com.agrisense.backend.controller;

import com.agrisense.backend.dto.YieldPredictionResponse;
import com.agrisense.backend.service.YieldPredictionService;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/predictionapi")
@CrossOrigin(origins = "*")
public class YieldPredictionController {

    private final YieldPredictionService yieldPredictionService;

    public YieldPredictionController(
            YieldPredictionService yieldPredictionService
    ) {
        this.yieldPredictionService =
                yieldPredictionService;
    }

    @GetMapping("/yield/{farmId}")
    public YieldPredictionResponse predictYield(
            @PathVariable Long farmId
    ) {

        return yieldPredictionService.predictYield(
                farmId
        );
    }
}