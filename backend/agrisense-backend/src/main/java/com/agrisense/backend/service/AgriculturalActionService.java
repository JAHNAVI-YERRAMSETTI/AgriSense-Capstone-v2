package com.agrisense.backend.service;

import com.agrisense.backend.dto.AgriculturalActionRequest;
import com.agrisense.backend.dto.AgriculturalActionResponse;
import com.agrisense.backend.model.AgriculturalAction;

import java.util.List;

public interface AgriculturalActionService {

    AgriculturalActionResponse addAction(
            AgriculturalActionRequest request);

    List<AgriculturalAction> getAllActions();

    List<AgriculturalAction> getActiveActions();

    AgriculturalAction getActionById(Long id);

    List<AgriculturalAction> getActionsForFarm(
            String crop,
            String growthStage);
}