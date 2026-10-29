package com.agrisense.backend.dto;

import java.util.List;

public class ConstraintValidationResponse {

    private boolean success;
    private String message;

    private Long farmId;
    private String actionName;

    private String overallStatus;

    private List<ConstraintResult> constraints;

    public ConstraintValidationResponse() {
    }

    public ConstraintValidationResponse(
            boolean success,
            String message,
            Long farmId,
            String actionName,
            String overallStatus,
            List<ConstraintResult> constraints) {

        this.success = success;
        this.message = message;
        this.farmId = farmId;
        this.actionName = actionName;
        this.overallStatus = overallStatus;
        this.constraints = constraints;
    }

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public Long getFarmId() {
        return farmId;
    }

    public void setFarmId(Long farmId) {
        this.farmId = farmId;
    }

    public String getActionName() {
        return actionName;
    }

    public void setActionName(String actionName) {
        this.actionName = actionName;
    }

    public String getOverallStatus() {
        return overallStatus;
    }

    public void setOverallStatus(String overallStatus) {
        this.overallStatus = overallStatus;
    }

    public List<ConstraintResult> getConstraints() {
        return constraints;
    }

    public void setConstraints(
            List<ConstraintResult> constraints) {

        this.constraints = constraints;
    }
}