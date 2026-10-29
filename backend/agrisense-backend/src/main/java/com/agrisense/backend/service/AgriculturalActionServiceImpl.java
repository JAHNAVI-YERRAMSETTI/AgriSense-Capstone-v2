package com.agrisense.backend.service;

import com.agrisense.backend.dto.AgriculturalActionRequest;
import com.agrisense.backend.dto.AgriculturalActionResponse;
import com.agrisense.backend.model.AgriculturalAction;
import com.agrisense.backend.repository.AgriculturalActionRepository;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AgriculturalActionServiceImpl
        implements AgriculturalActionService {

    private final AgriculturalActionRepository repository;

    public AgriculturalActionServiceImpl(
            AgriculturalActionRepository repository) {

        this.repository = repository;
    }

    @Override
    public AgriculturalActionResponse addAction(
            AgriculturalActionRequest request) {

        if (request.getActionName() == null ||
                request.getActionName().trim().isEmpty()) {

            return new AgriculturalActionResponse(
                    false,
                    "Action name is required.",
                    null
            );
        }

        AgriculturalAction action = new AgriculturalAction();

        action.setActionName(request.getActionName().trim());
        action.setCategory(request.getCategory());
        action.setDescription(request.getDescription());

        action.setRequiredWater(request.getRequiredWater());
        action.setRequiredLabour(request.getRequiredLabour());
        action.setRequiredBudget(request.getRequiredBudget());

        action.setApplicableCrop(request.getApplicableCrop());
        action.setApplicableGrowthStage(
                request.getApplicableGrowthStage());

        action.setEvidenceStatus(request.getEvidenceStatus());
        action.setSourceReference(request.getSourceReference());

        action.setActive(
                request.getActive() == null
                        ? true
                        : request.getActive()
        );

        AgriculturalAction saved =
                repository.save(action);

        return new AgriculturalActionResponse(
                true,
                "Agricultural action added successfully.",
                saved
        );
    }

    @Override
    public List<AgriculturalAction> getAllActions() {
        return repository.findAll();
    }

    @Override
    public List<AgriculturalAction> getActiveActions() {
        return repository.findByActiveTrue();
    }

    @Override
    public AgriculturalAction getActionById(Long id) {

        return repository.findById(id)
                .orElse(null);
    }

    @Override
    public List<AgriculturalAction> getActionsForFarm(
            String crop,
            String growthStage) {

        if (crop == null || crop.trim().isEmpty()) {
            return List.of();
        }

        if (growthStage == null ||
                growthStage.trim().isEmpty()) {

            return repository.findByApplicableCropAndActiveTrue(
                    crop);
        }

        return repository
                .findByApplicableCropAndApplicableGrowthStageAndActiveTrue(
                        crop,
                        growthStage
                );
    }
}