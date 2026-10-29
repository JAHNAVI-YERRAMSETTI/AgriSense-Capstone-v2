package com.agrisense.backend.repository;

import com.agrisense.backend.model.AgriculturalAction;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AgriculturalActionRepository
        extends JpaRepository<AgriculturalAction, Long> {

    List<AgriculturalAction> findByActiveTrue();

    List<AgriculturalAction> findByApplicableCropAndActiveTrue(
            String applicableCrop);

    List<AgriculturalAction> findByApplicableCropAndApplicableGrowthStageAndActiveTrue(
            String applicableCrop,
            String applicableGrowthStage);
}