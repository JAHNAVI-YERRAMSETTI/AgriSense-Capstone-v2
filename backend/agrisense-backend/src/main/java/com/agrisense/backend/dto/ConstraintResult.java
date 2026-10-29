package com.agrisense.backend.dto;

public class ConstraintResult {

    private String category;
    private String status;
    private String message;

    public ConstraintResult() {
    }

    public ConstraintResult(
            String category,
            String status,
            String message) {

        this.category = category;
        this.status = status;
        this.message = message;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}