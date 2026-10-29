package com.agrisense.backend.model;

import jakarta.persistence.*;

@Entity
@Table(name = "agricultural_actions")
public class AgriculturalAction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String actionName;

    private String category;

    @Column(length = 1000)
    private String description;

    private Double requiredWater;

    private Integer requiredLabour;

    private Double requiredBudget;

    private String applicableCrop;

    private String applicableGrowthStage;

    private String evidenceStatus;

    private String sourceReference;

    private Boolean active;

    public AgriculturalAction() {
    }

    public AgriculturalAction(
            Long id,
            String actionName,
            String category,
            String description,
            Double requiredWater,
            Integer requiredLabour,
            Double requiredBudget,
            String applicableCrop,
            String applicableGrowthStage,
            String evidenceStatus,
            String sourceReference,
            Boolean active) {

        this.id = id;
        this.actionName = actionName;
        this.category = category;
        this.description = description;
        this.requiredWater = requiredWater;
        this.requiredLabour = requiredLabour;
        this.requiredBudget = requiredBudget;
        this.applicableCrop = applicableCrop;
        this.applicableGrowthStage = applicableGrowthStage;
        this.evidenceStatus = evidenceStatus;
        this.sourceReference = sourceReference;
        this.active = active;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getActionName() {
        return actionName;
    }

    public void setActionName(String actionName) {
        this.actionName = actionName;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Double getRequiredWater() {
        return requiredWater;
    }

    public void setRequiredWater(Double requiredWater) {
        this.requiredWater = requiredWater;
    }

    public Integer getRequiredLabour() {
        return requiredLabour;
    }

    public void setRequiredLabour(Integer requiredLabour) {
        this.requiredLabour = requiredLabour;
    }

    public Double getRequiredBudget() {
        return requiredBudget;
    }

    public void setRequiredBudget(Double requiredBudget) {
        this.requiredBudget = requiredBudget;
    }

    public String getApplicableCrop() {
        return applicableCrop;
    }

    public void setApplicableCrop(String applicableCrop) {
        this.applicableCrop = applicableCrop;
    }

    public String getApplicableGrowthStage() {
        return applicableGrowthStage;
    }

    public void setApplicableGrowthStage(String applicableGrowthStage) {
        this.applicableGrowthStage = applicableGrowthStage;
    }

    public String getEvidenceStatus() {
        return evidenceStatus;
    }

    public void setEvidenceStatus(String evidenceStatus) {
        this.evidenceStatus = evidenceStatus;
    }

    public String getSourceReference() {
        return sourceReference;
    }

    public void setSourceReference(String sourceReference) {
        this.sourceReference = sourceReference;
    }

    public Boolean getActive() {
        return active;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }
}