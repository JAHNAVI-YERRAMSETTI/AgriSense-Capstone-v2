package com.agrisense.backend.controller;

import com.agrisense.backend.dto.DiseaseDetectionResponse;
import com.agrisense.backend.service.DiseaseDetectionService;

import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/predictionapi")
@CrossOrigin(origins = "*")
public class DiseaseDetectionController {

    private final DiseaseDetectionService diseaseDetectionService;

    public DiseaseDetectionController(
            DiseaseDetectionService diseaseDetectionService
    ) {
        this.diseaseDetectionService = diseaseDetectionService;
    }

    @PostMapping(
            value = "/disease-detection/{farmId}",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public DiseaseDetectionResponse detectDisease(
            @PathVariable Long farmId,
            @RequestParam("image") MultipartFile image
    ) {
        return diseaseDetectionService.detectDisease(
                farmId,
                image
        );
    }
}