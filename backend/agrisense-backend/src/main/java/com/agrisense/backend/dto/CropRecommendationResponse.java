package com.agrisense.backend.dto;

import java.util.List;

public class CropRecommendationResponse {

    private boolean success;
    private String message;
    private Long farmId;
    private String recommendedCrop;
    private List<TopRecommendation> topRecommendations;

    public CropRecommendationResponse() {
    }

    public CropRecommendationResponse(
            boolean success,
            String message,
            Long farmId,
            String recommendedCrop,
            List<TopRecommendation> topRecommendations) {

        this.success = success;
        this.message = message;
        this.farmId = farmId;
        this.recommendedCrop = recommendedCrop;
        this.topRecommendations = topRecommendations;
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

    public String getRecommendedCrop() {
        return recommendedCrop;
    }

    public void setRecommendedCrop(String recommendedCrop) {
        this.recommendedCrop = recommendedCrop;
    }

    public List<TopRecommendation> getTopRecommendations() {
        return topRecommendations;
    }

    public void setTopRecommendations(
            List<TopRecommendation> topRecommendations) {

        this.topRecommendations = topRecommendations;
    }

    public static class TopRecommendation {

        private String crop;
        private double probability;

        public TopRecommendation() {
        }

        public TopRecommendation(
                String crop,
                double probability) {

            this.crop = crop;
            this.probability = probability;
        }

        public String getCrop() {
            return crop;
        }

        public void setCrop(String crop) {
            this.crop = crop;
        }

        public double getProbability() {
            return probability;
        }

        public void setProbability(double probability) {
            this.probability = probability;
        }
    }
}