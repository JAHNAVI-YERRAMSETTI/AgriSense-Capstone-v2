package com.agrisense.backend.dto;

import com.agrisense.backend.model.AgriculturalAction;

public class AgriculturalActionResponse {

    private boolean success;
    private String message;
    private AgriculturalAction action;

    public AgriculturalActionResponse() {
    }

    public AgriculturalActionResponse(
            boolean success,
            String message,
            AgriculturalAction action) {

        this.success = success;
        this.message = message;
        this.action = action;
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

    public AgriculturalAction getAction() {
        return action;
    }

    public void setAction(AgriculturalAction action) {
        this.action = action;
    }
}