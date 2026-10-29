package com.agrisense.backend.service;

import java.util.Arrays;
import java.util.List;
import java.util.Map;

import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import com.agrisense.backend.dto.CropRecommendationResponse;
import com.agrisense.backend.model.Farm;
import com.agrisense.backend.model.FarmState;
import com.agrisense.backend.repository.FarmRepository;
import com.agrisense.backend.repository.FarmStateRepository;

@Service
public class CropRecommendationServiceImpl
        implements CropRecommendationService {

    private final FarmRepository farmRepository;
    private final FarmStateRepository farmStateRepository;
    private final RestClient restClient;

    public CropRecommendationServiceImpl(
            FarmRepository farmRepository,
            FarmStateRepository farmStateRepository) {

        this.farmRepository = farmRepository;
        this.farmStateRepository = farmStateRepository;

        this.restClient = RestClient.builder()
                .baseUrl("http://localhost:5000")
                .build();
    }

    @Override
    public CropRecommendationResponse recommendCrop(Long farmId) {

        Farm farm = farmRepository
                .findById(farmId)
                .orElse(null);

        if (farm == null) {
            return new CropRecommendationResponse(
                    false,
                    "Farm not found",
                    farmId,
                    null,
                    List.of()
            );
        }

        FarmState farmState = farmStateRepository
                .findByFarm(farm)
                .orElse(null);

        if (farmState == null) {
            return new CropRecommendationResponse(
                    false,
                    "Farm state not found",
                    farmId,
                    null,
                    List.of()
            );
        }

        if (farmState.getNitrogen() == null
                || farmState.getPhosphorus() == null
                || farmState.getPotassium() == null
                || farmState.getTemperature() == null
                || farmState.getHumidity() == null
                || farmState.getSoilPh() == null
                || farmState.getRainfall() == null) {

            return new CropRecommendationResponse(
                    false,
                    "Required farm state values are missing",
                    farmId,
                    null,
                    List.of()
            );
        }

        Map<String, Object> requestBody = Map.of(
                "N", farmState.getNitrogen(),
                "P", farmState.getPhosphorus(),
                "K", farmState.getPotassium(),
                "temperature", farmState.getTemperature(),
                "humidity", farmState.getHumidity(),
                "ph", farmState.getSoilPh(),
                "rainfall", farmState.getRainfall()
        );

        try {

            Map<?, ?> mlResponse = restClient
                    .post()
                    .uri("/predict")
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(requestBody)
                    .retrieve()
                    .body(Map.class);

            if (mlResponse == null) {
                return new CropRecommendationResponse(
                        false,
                        "No response received from ML service",
                        farmId,
                        null,
                        List.of()
                );
            }

            Boolean success =
                    (Boolean) mlResponse.get("success");

            if (!Boolean.TRUE.equals(success)) {

                String message =
                        String.valueOf(
                                mlResponse.get("message")
                        );

                return new CropRecommendationResponse(
                        false,
                        message,
                        farmId,
                        null,
                        List.of()
                );
            }

            String recommendedCrop =
                    String.valueOf(
                            mlResponse.get("recommendedCrop")
                    );

            List<CropRecommendationResponse.TopRecommendation>
                    topRecommendations = List.of();

            Object recommendationsObject =
                    mlResponse.get("topRecommendations");

            if (recommendationsObject instanceof List<?> recommendations) {

                topRecommendations =
                        recommendations.stream()
                                .filter(item -> item instanceof Map<?, ?>)
                                .map(item -> {

                                    Map<?, ?> recommendation =
                                            (Map<?, ?>) item;

                                    String crop =
                                            String.valueOf(
                                                    recommendation.get("crop")
                                            );

                                    double probability =
                                            ((Number)
                                                    recommendation.get("probability"))
                                                    .doubleValue();

                                    return new CropRecommendationResponse
                                            .TopRecommendation(
                                                    crop,
                                                    probability
                                            );
                                })
                                .toList();
            }

            return new CropRecommendationResponse(
                    true,
                    "Crop recommendation generated successfully",
                    farmId,
                    recommendedCrop,
                    topRecommendations
            );

        } catch (Exception error) {

            return new CropRecommendationResponse(
                    false,
                    "Unable to connect to crop recommendation ML service",
                    farmId,
                    null,
                    List.of()
            );
        }
    }
}