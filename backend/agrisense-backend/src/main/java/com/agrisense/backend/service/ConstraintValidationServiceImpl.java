
package com.agrisense.backend.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.agrisense.backend.dto.ConstraintResult;
import com.agrisense.backend.dto.ConstraintValidationRequest;
import com.agrisense.backend.dto.ConstraintValidationResponse;
import com.agrisense.backend.model.AgriculturalAction;
import com.agrisense.backend.model.Farm;
import com.agrisense.backend.model.FarmState;
import com.agrisense.backend.repository.AgriculturalActionRepository;
import com.agrisense.backend.repository.FarmRepository;
import com.agrisense.backend.repository.FarmStateRepository;

@Service
public class ConstraintValidationServiceImpl
        implements ConstraintValidationService {

    private final FarmRepository farmRepository;
    private final FarmStateRepository farmStateRepository;
    private final AgriculturalActionRepository agriculturalActionRepository;

    public ConstraintValidationServiceImpl(
            FarmRepository farmRepository,
            FarmStateRepository farmStateRepository,
            AgriculturalActionRepository agriculturalActionRepository) {

        this.farmRepository = farmRepository;
        this.farmStateRepository = farmStateRepository;
        this.agriculturalActionRepository = agriculturalActionRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public ConstraintValidationResponse validateAction(
            ConstraintValidationRequest request) {

        // 1. Validate the request.
        if (request == null
                || request.getFarmId() == null
                || request.getActionId() == null) {

            return failureResponse(
                    request != null ? request.getFarmId() : null,
                    "Farm ID and Action ID are required.");
        }

        // 2. Find the farm.
        Farm farm = farmRepository
                .findById(request.getFarmId())
                .orElse(null);

        if (farm == null) {
            return failureResponse(
                    request.getFarmId(),
                    "Farm not found.");
        }

        // 3. Find the latest stored farm state.
        FarmState farmState = farmStateRepository
                .findByFarm(farm)
                .orElse(null);

        if (farmState == null) {
            return failureResponse(
                    farm.getId(),
                    "Farm state not found. Update the farm state before validation.");
        }

        // 4. Find the agricultural action.
        AgriculturalAction action = agriculturalActionRepository
                .findById(request.getActionId())
                .orElse(null);

        if (action == null) {
            return failureResponse(
                    farm.getId(),
                    "Agricultural action not found.");
        }

        // 5. Do not validate inactive actions.
        if (!Boolean.TRUE.equals(action.getActive())) {
            return failureResponse(
                    farm.getId(),
                    "This agricultural action is inactive and cannot be validated.");
        }

        List<ConstraintResult> constraints = new ArrayList<>();

        // 6. Validate crop and growth-stage applicability independently.
        validateCropApplicability(action, farmState, constraints);
        validateGrowthStageApplicability(action, farmState, constraints);

        // 7. Validate resource requirements.
        validateWater(action, farmState, constraints);
        validateLabour(action, farmState, constraints);
        validateBudget(action, farmState, constraints);

        // 8. Determine the overall result.
        String overallStatus = determineOverallStatus(constraints);

        String message;

        if ("FEASIBLE".equals(overallStatus)) {
            message = "All applicability and resource checks passed.";
        } else if ("INFEASIBLE".equals(overallStatus)) {
            message = "One or more constraints are not satisfied.";
        } else {
            message = "Validation is incomplete because some information is unavailable.";
        }

        return new ConstraintValidationResponse(
                true,
                message,
                farm.getId(),
                action.getActionName(),
                overallStatus,
                constraints);
    }

    private void validateCropApplicability(
            AgriculturalAction action,
            FarmState farmState,
            List<ConstraintResult> constraints) {

        String requiredCrop = normalize(action.getApplicableCrop());
        String currentCrop = normalize(farmState.getCrop());

        if (requiredCrop == null) {
            constraints.add(new ConstraintResult(
                    "CROP_APPLICABILITY",
                    "UNKNOWN",
                    "The action's applicable crop is not specified."));
            return;
        }

        if (currentCrop == null) {
            constraints.add(new ConstraintResult(
                    "CROP_APPLICABILITY",
                    "UNKNOWN",
                    "The farm's current crop is not available."));
            return;
        }

        if (requiredCrop.equalsIgnoreCase(currentCrop)) {
            constraints.add(new ConstraintResult(
                    "CROP_APPLICABILITY",
                    "FEASIBLE",
                    "The action matches the farm's current crop."));
        } else {
            constraints.add(new ConstraintResult(
                    "CROP_APPLICABILITY",
                    "INFEASIBLE",
                    "This action is intended for " + requiredCrop
                            + ", but the farm currently has " + currentCrop + "."));
        }
    }

    private void validateGrowthStageApplicability(
            AgriculturalAction action,
            FarmState farmState,
            List<ConstraintResult> constraints) {

        String requiredStage = normalize(action.getApplicableGrowthStage());
        String currentStage = normalize(farmState.getGrowthStage());

        if (requiredStage == null) {
            constraints.add(new ConstraintResult(
                    "GROWTH_STAGE_APPLICABILITY",
                    "UNKNOWN",
                    "The action's applicable growth stage is not specified."));
            return;
        }

        if (currentStage == null) {
            constraints.add(new ConstraintResult(
                    "GROWTH_STAGE_APPLICABILITY",
                    "UNKNOWN",
                    "The farm's current growth stage is not available."));
            return;
        }

        if (requiredStage.equalsIgnoreCase(currentStage)) {
            constraints.add(new ConstraintResult(
                    "GROWTH_STAGE_APPLICABILITY",
                    "FEASIBLE",
                    "The action matches the farm's current growth stage."));
        } else {
            constraints.add(new ConstraintResult(
                    "GROWTH_STAGE_APPLICABILITY",
                    "INFEASIBLE",
                    "This action is intended for growth stage "
                            + requiredStage + ", but the farm is at "
                            + currentStage + "."));
        }
    }

    private void validateWater(
            AgriculturalAction action,
            FarmState farmState,
            List<ConstraintResult> constraints) {

        Double required = action.getRequiredWater();
        Double available = farmState.getWaterAvailable();

        if (required != null && !isValidRequirement(required)) {
            constraints.add(new ConstraintResult(
                    "WATER",
                    "UNKNOWN",
                    "The stored water requirement is invalid. Correct the action data."));
            return;
        }

        if (required == null) {
            constraints.add(new ConstraintResult(
                    "WATER",
                    "UNKNOWN",
                    "Water requirement is not available for this action."));
            return;
        }

        if (available == null) {
            constraints.add(new ConstraintResult(
                    "WATER",
                    "UNKNOWN",
                    "Current farm water availability is not available."));
            return;
        }

        if (!Double.isFinite(available) || available < 0) {
            constraints.add(new ConstraintResult(
                    "WATER",
                    "UNKNOWN",
                    "Stored farm water availability is invalid."));
            return;
        }

        if (available >= required) {
            constraints.add(new ConstraintResult(
                    "WATER",
                    "FEASIBLE",
                    "Available water meets the action requirement."));
        } else {
            constraints.add(new ConstraintResult(
                    "WATER",
                    "INFEASIBLE",
                    "Insufficient water. Required: " + required
                            + "; available: " + available + "."));
        }
    }

    private void validateLabour(
            AgriculturalAction action,
            FarmState farmState,
            List<ConstraintResult> constraints) {

        Integer required = action.getRequiredLabour();
        Integer available = farmState.getLabourAvailable();

        if (required != null && required < 0) {
            constraints.add(new ConstraintResult(
                    "LABOUR",
                    "UNKNOWN",
                    "The stored labour requirement is invalid. Correct the action data."));
            return;
        }

        if (required == null) {
            constraints.add(new ConstraintResult(
                    "LABOUR",
                    "UNKNOWN",
                    "Labour requirement is not available for this action."));
            return;
        }

        if (available == null) {
            constraints.add(new ConstraintResult(
                    "LABOUR",
                    "UNKNOWN",
                    "Current farm labour availability is not available."));
            return;
        }

        if (available < 0) {
            constraints.add(new ConstraintResult(
                    "LABOUR",
                    "UNKNOWN",
                    "Stored farm labour availability is invalid."));
            return;
        }

        if (available >= required) {
            constraints.add(new ConstraintResult(
                    "LABOUR",
                    "FEASIBLE",
                    "Available labour meets the action requirement."));
        } else {
            constraints.add(new ConstraintResult(
                    "LABOUR",
                    "INFEASIBLE",
                    "Insufficient labour. Required: " + required
                            + "; available: " + available + "."));
        }
    }

    private void validateBudget(
            AgriculturalAction action,
            FarmState farmState,
            List<ConstraintResult> constraints) {

        Double required = action.getRequiredBudget();
        Double available = farmState.getBudgetAvailable();

        if (required != null && !isValidRequirement(required)) {
            constraints.add(new ConstraintResult(
                    "BUDGET",
                    "UNKNOWN",
                    "The stored budget requirement is invalid. Correct the action data."));
            return;
        }

        if (required == null) {
            constraints.add(new ConstraintResult(
                    "BUDGET",
                    "UNKNOWN",
                    "Budget requirement is not available for this action."));
            return;
        }

        if (available == null) {
            constraints.add(new ConstraintResult(
                    "BUDGET",
                    "UNKNOWN",
                    "Current farm budget availability is not available."));
            return;
        }

        if (!Double.isFinite(available) || available < 0) {
            constraints.add(new ConstraintResult(
                    "BUDGET",
                    "UNKNOWN",
                    "Stored farm budget availability is invalid."));
            return;
        }

        if (available >= required) {
            constraints.add(new ConstraintResult(
                    "BUDGET",
                    "FEASIBLE",
                    "Available budget meets the action requirement."));
        } else {
            constraints.add(new ConstraintResult(
                    "BUDGET",
                    "INFEASIBLE",
                    "Insufficient budget. Required: " + required
                            + "; available: " + available + "."));
        }
    }

    private boolean isValidRequirement(Double value) {
        return Double.isFinite(value) && value >= 0;
    }

    private String normalize(String value) {
        if (value == null || value.trim().isEmpty()) {
            return null;
        }
        return value.trim();
    }

    private String determineOverallStatus(
            List<ConstraintResult> constraints) {

        boolean hasUnknown = false;

        for (ConstraintResult constraint : constraints) {
            if ("INFEASIBLE".equalsIgnoreCase(constraint.getStatus())) {
                // A confirmed violation takes precedence over unknown checks.
                return "INFEASIBLE";
            }

            if (!"FEASIBLE".equalsIgnoreCase(constraint.getStatus())) {
                hasUnknown = true;
            }
        }

        return hasUnknown ? "UNKNOWN" : "FEASIBLE";
    }

    private ConstraintValidationResponse failureResponse(
            Long farmId,
            String message) {

        return new ConstraintValidationResponse(
                false,
                message,
                farmId,
                null,
                "UNKNOWN",
                new ArrayList<>());
    }
}
