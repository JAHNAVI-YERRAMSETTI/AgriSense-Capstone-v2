package com.agrisense.backend.controller;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.agrisense.backend.dto.FarmResponse;
import com.agrisense.backend.model.Farm;
import com.agrisense.backend.service.FarmService;

@RestController
@RequestMapping("/farmapi")
@CrossOrigin(origins = "*")
public class FarmController {

    private final FarmService farmService;

    public FarmController(FarmService farmService) {
        this.farmService = farmService;
    }

    @PostMapping("/add")
    public ResponseEntity<FarmResponse> addFarm(@RequestBody Farm farm) {

        Farm savedFarm = farmService.addFarm(farm);

        FarmResponse response = convertToResponse(savedFarm);

        return new ResponseEntity<>(
                response,
                HttpStatus.CREATED
        );
    }
    
    @GetMapping("/viewall")
    public ResponseEntity<List<FarmResponse>> getAllFarms() {

        List<Farm> farms = farmService.getAllFarms();

        List<FarmResponse> response = farms.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }

    @GetMapping("/view/{id}")
    public ResponseEntity<FarmResponse> getFarmById(
            @PathVariable Long id) {

        Farm farm = farmService.getFarmById(id);

        if (farm == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(convertToResponse(farm));
    }

    @GetMapping("/farmer/{farmerId}")
    public ResponseEntity<List<FarmResponse>> getFarmsByFarmer(
            @PathVariable Long farmerId) {

    	List<Farm> farms = farmService.getFarmsByFarmerId(farmerId);
        List<FarmResponse> response = farms.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<FarmResponse> updateFarm(
            @PathVariable Long id,
            @RequestBody Farm farm) {

        Farm updatedFarm = farmService.updateFarm(id, farm);

        if (updatedFarm == null) {
            return new ResponseEntity<>(
                    HttpStatus.NOT_FOUND
            );
        }

        FarmResponse response = convertToResponse(updatedFarm);

        return new ResponseEntity<>(
                response,
                HttpStatus.OK
        );
    }
    
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<String> deleteFarm(
            @PathVariable Long id) {

        boolean deleted = farmService.deleteFarm(id);

        if (!deleted) {
            return new ResponseEntity<>(
                    "Farm not found",
                    HttpStatus.NOT_FOUND
            );
        }

        return new ResponseEntity<>(
                "Farm deleted successfully",
                HttpStatus.OK
        );
    }

    private FarmResponse convertToResponse(Farm farm) {

        return new FarmResponse(
                farm.getId(),
                farm.getFarmer().getId(),
                farm.getFarmName(),
                farm.getLocation(),
                farm.getArea(),
                farm.getCrop(),
                farm.getVariety(),
                farm.getGrowthStage()
        );
    }
}