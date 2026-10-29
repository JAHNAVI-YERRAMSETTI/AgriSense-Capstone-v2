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

import com.agrisense.backend.dto.FarmStateResponse;
import com.agrisense.backend.model.FarmState;
import com.agrisense.backend.service.FarmStateService;

@RestController
@RequestMapping("/farmstateapi")
@CrossOrigin(origins = "*")
public class FarmStateController {

    private final FarmStateService farmStateService;

    public FarmStateController(FarmStateService farmStateService) {
        this.farmStateService = farmStateService;
    }

    @PostMapping("/add")
    public ResponseEntity<FarmStateResponse> addFarmState(
            @RequestBody FarmState farmState) {

        FarmState savedState = farmStateService.addFarmState(farmState);

        return new ResponseEntity<>(
                convertToResponse(savedState),
                HttpStatus.CREATED
        );
    }

    @GetMapping("/viewall")
    public ResponseEntity<List<FarmStateResponse>> getAllFarmStates() {

        List<FarmState> states = farmStateService.getAllFarmStates();

        List<FarmStateResponse> response = states.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }

    @GetMapping("/view/{id}")
    public ResponseEntity<FarmStateResponse> getFarmStateById(
            @PathVariable Long id) {

        FarmState state = farmStateService.getFarmStateById(id);

        if (state == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(convertToResponse(state));
    }

    @GetMapping("/farm/{farmId}")
    public ResponseEntity<FarmStateResponse> getFarmStateByFarmId(
            @PathVariable Long farmId) {

        FarmState state = farmStateService.getFarmStateByFarmId(farmId);

        if (state == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(convertToResponse(state));
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<FarmStateResponse> updateFarmState(
            @PathVariable Long id,
            @RequestBody FarmState farmState) {

        FarmState updatedState =
                farmStateService.updateFarmState(id, farmState);

        if (updatedState == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(convertToResponse(updatedState));
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<String> deleteFarmState(
            @PathVariable Long id) {

        boolean deleted = farmStateService.deleteFarmState(id);

        if (!deleted) {
            return new ResponseEntity<>(
                    "Farm state not found",
                    HttpStatus.NOT_FOUND
            );
        }

        return new ResponseEntity<>(
                "Farm state deleted successfully",
                HttpStatus.OK
        );
    }

    private FarmStateResponse convertToResponse(FarmState state) {

        return new FarmStateResponse(
                state.getId(),
                state.getFarm().getId(),
                state.getCrop(),
                state.getGrowthStage(),
                state.getSoilMoisture(),
                state.getSoilPh(),
                state.getNitrogen(),
                state.getPhosphorus(),
                state.getPotassium(),
                state.getTemperature(),
                state.getHumidity(),
                state.getRainfall(),
                state.getWaterAvailable(),
                state.getLabourAvailable(),
                state.getBudgetAvailable(),
                state.getCropHealth(),
                state.getDiseaseStatus()
        );
    }}