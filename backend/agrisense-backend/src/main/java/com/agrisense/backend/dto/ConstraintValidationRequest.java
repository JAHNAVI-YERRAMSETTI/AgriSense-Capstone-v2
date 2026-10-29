package com.agrisense.backend.dto;

public class ConstraintValidationRequest {

    private Long farmId;
    private Long actionId;

    public ConstraintValidationRequest() {
    }

    public Long getFarmId() {
        return farmId;
    }

    public void setFarmId(Long farmId) {
        this.farmId = farmId;
    }

    public Long getActionId() {
        return actionId;
    }

    public void setActionId(Long actionId) {
        this.actionId = actionId;
    }
}