package com.agrisense.backend.service;

import com.agrisense.backend.dto.YieldPredictionResponse;
import com.agrisense.backend.model.Farm;
import com.agrisense.backend.repository.FarmRepository;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.client.RestClient;

import java.time.Year;
import java.util.Map;

@Service
public class YieldPredictionServiceImpl
        implements YieldPredictionService {

    private final FarmRepository farmRepository;
    private final RestClient restClient;

    @Value("${agrisense.ml.yield-url}")
    private String yieldUrl;

    public YieldPredictionServiceImpl(
            FarmRepository farmRepository
    ) {
        this.farmRepository = farmRepository;
        this.restClient = RestClient.create();
    }

    @Override
    public YieldPredictionResponse predictYield(Long farmId) {

        Farm farm = farmRepository.findById(farmId)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Farm not found"
                        )
                );

        if (farm.getCrop() == null ||
                farm.getCrop().isBlank()) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Crop is required for yield prediction"
            );
        }

        if (farm.getLocation() == null ||
                farm.getLocation().isBlank()) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Farm location is required for yield prediction"
            );
        }

        if (farm.getArea() == null ||
                farm.getArea() <= 0) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Farm area must be greater than zero"
            );
        }

        /*
         * Current yield model expects:
         * Year
         * State
         * District
         * Crop
         * Area
         *
         * Farm location currently stores a general location string.
         * For the first integration, it is passed as district.
         *
         * A proper location-to-district mapping can be added later
         * when the context interpretation module is implemented.
         */

        Map<String, Object> requestBody = Map.of(
                "year", Year.now().getValue(),
                "state", "Andhra Pradesh",
                "district", farm.getLocation(),
                "crop", farm.getCrop(),
                "area", farm.getArea()
        );

        try {

            YieldPredictionResponse mlResponse =
                    restClient.post()
                            .uri(yieldUrl)
                            .body(requestBody)
                            .retrieve()
                            .body(YieldPredictionResponse.class);

            if (mlResponse == null) {

                throw new ResponseStatusException(
                        HttpStatus.BAD_GATEWAY,
                        "Empty response from Yield Prediction API"
                );
            }

            return new YieldPredictionResponse(
                    mlResponse.success(),
                    mlResponse.message(),
                    farmId,
                    farm.getCrop(),
                    farm.getLocation(),
                    farm.getArea(),
                    mlResponse.predictedYieldKgPerHa()
            );

        } catch (
                org.springframework.web.client.RestClientException exception
        ) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_GATEWAY,
                    "Yield Prediction API is unavailable",
                    exception
            );
        }
    }
}