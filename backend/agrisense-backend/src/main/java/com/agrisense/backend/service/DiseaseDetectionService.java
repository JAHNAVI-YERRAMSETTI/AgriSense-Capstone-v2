package com.agrisense.backend.service;

import org.springframework.web.multipart.MultipartFile;
import com.agrisense.backend.dto.DiseaseDetectionResponse;

public interface DiseaseDetectionService {

    DiseaseDetectionResponse detectDisease(
            Long farmId,
            MultipartFile image
    );
}