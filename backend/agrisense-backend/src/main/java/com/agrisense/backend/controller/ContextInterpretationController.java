package com.agrisense.backend.controller;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.agrisense.backend.dto.ContextInterpretationResponse;
import com.agrisense.backend.service.ContextInterpretationService;

@RestController
@RequestMapping("/predictionapi")
@CrossOrigin(origins = "*")
public class ContextInterpretationController {

    private final ContextInterpretationService contextInterpretationService;

    public ContextInterpretationController(
            ContextInterpretationService contextInterpretationService) {

        this.contextInterpretationService =
                contextInterpretationService;
    }

    @GetMapping("/context/{farmId}")
    public ContextInterpretationResponse interpretContext(
            @PathVariable Long farmId) {

        return contextInterpretationService
                .interpretFarmContext(farmId);
    }
}