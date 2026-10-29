package com.agrisense.backend.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.agrisense.backend.dto.FarmerResponse;
import com.agrisense.backend.dto.FarmerUpdateRequest;
import com.agrisense.backend.service.FarmerService;

@RestController
@RequestMapping("/farmerapi")
@CrossOrigin(origins = "*")
public class FarmerController {

    private final FarmerService farmerService;

    public FarmerController(FarmerService farmerService) {
        this.farmerService = farmerService;
    }

    @GetMapping("/{id}")
    public ResponseEntity<FarmerResponse> getFarmer(
            @PathVariable Long id
    ) {

        FarmerResponse farmer =
                farmerService.getFarmerById(id);

        if (farmer == null) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .build();
        }

        return ResponseEntity.ok(farmer);
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<FarmerResponse> updateFarmer(
            @PathVariable Long id,
            @RequestBody FarmerUpdateRequest request
    ) {

        FarmerResponse farmer =
                farmerService.updateFarmer(id, request);

        if (farmer == null) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .build();
        }

        return ResponseEntity.ok(farmer);
    }
}