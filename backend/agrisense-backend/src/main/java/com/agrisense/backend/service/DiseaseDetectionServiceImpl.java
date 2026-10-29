package com.agrisense.backend.service;

import com.agrisense.backend.dto.DiseaseDetectionResponse;
import com.agrisense.backend.repository.FarmRepository;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.stereotype.Service;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClient;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;

@Service
public class DiseaseDetectionServiceImpl
        implements DiseaseDetectionService {

    private final FarmRepository farmRepository;

    private final RestClient restClient;

    @Value("${agrisense.ml.disease-url}")
    private String diseaseUrl;

    public DiseaseDetectionServiceImpl(
            FarmRepository farmRepository
    ) {
        this.farmRepository = farmRepository;
        this.restClient = RestClient.create();
    }

    @Override
    public DiseaseDetectionResponse detectDisease(
            Long farmId,
            MultipartFile image
    ) {

        if (!farmRepository.existsById(farmId)) {

            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Farm not found"
            );
        }

        if (image == null || image.isEmpty()) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Please upload a leaf image"
            );
        }

        try {

            ByteArrayResource imageResource =
                    new ByteArrayResource(image.getBytes()) {

                        @Override
                        public String getFilename() {

                            return image.getOriginalFilename() != null
                                    ? image.getOriginalFilename()
                                    : "leaf.jpg";
                        }
                    };

            MultiValueMap<String, Object> body =
                    new org.springframework.util.LinkedMultiValueMap<>();

            body.add("image", imageResource);

            DiseaseDetectionResponse flaskResponse =
                    restClient.post()
                            .uri(diseaseUrl)
                            .contentType(MediaType.MULTIPART_FORM_DATA)
                            .body(body)
                            .retrieve()
                            .body(DiseaseDetectionResponse.class);

            if (flaskResponse == null) {

                throw new ResponseStatusException(
                        HttpStatus.BAD_GATEWAY,
                        "Empty response from disease model"
                );
            }

            return new DiseaseDetectionResponse(
                    flaskResponse.success(),
                    flaskResponse.message(),
                    farmId,
                    flaskResponse.predictedDisease(),
                    flaskResponse.confidence(),
                    flaskResponse.topPredictions()
            );

        } catch (IOException exception) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Unable to read uploaded image",
                    exception
            );

        } catch (org.springframework.web.client.RestClientException exception) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_GATEWAY,
                    "Disease Detection API is unavailable",
                    exception
            );
        }
    }
}
