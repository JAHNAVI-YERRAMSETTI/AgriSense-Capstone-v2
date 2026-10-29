package com.agrisense.backend.dto;

public class AgriculturalActionRequest {

    private String actionName;
    private String category;
    private String description;

    private Double requiredWater;
    private Integer requiredLabour;
    private Double requiredBudget;

    private String applicableCrop;
    private String applicableGrowthStage;

    private String evidenceStatus;
    private String sourceReference;

    private Boolean active;

    public AgriculturalActionRequest() {
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