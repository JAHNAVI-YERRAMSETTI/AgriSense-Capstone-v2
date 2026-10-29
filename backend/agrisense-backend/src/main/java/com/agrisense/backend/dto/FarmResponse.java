package com.agrisense.backend.dto;

public class FarmResponse {

    private Long id;
    private Long farmerId;
    private String farmName;
    private String location;
    private Double area;
    private String crop;
    private String variety;
    private String growthStage;

    public FarmResponse() {
    }

    public FarmResponse(Long id, Long farmerId, String farmName,
                        String location, Double area, String crop,
                        String variety, String growthStage) {
        this.id = id;
        this.farmerId = farmerId;
        this.farmName = farmName;
        this.location = location;
        this.area = area;
        this.crop = crop;
        this.variety = variety;
        this.growthStage = growthStage;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getFarmerId() {
        return farmerId;
    }

    public void setFarmerId(Long farmerId) {
        this.farmerId = farmerId;
    }

    public String getFarmName() {
        return farmName;
    }

    public void setFarmName(String farmName) {
        this.farmName = farmName;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public Double getArea() {
        return area;
    }

    public void setArea(Double area) {
        this.area = area;
    }

    public String getCrop() {
        return crop;
    }

    public void setCrop(String crop) {
        this.crop = crop;
    }

    public String getVariety() {
        return variety;
    }

    public void setVariety(String variety) {
        this.variety = variety;
    }

    public String getGrowthStage() {
        return growthStage;
    }

    public void setGrowthStage(String growthStage) {
        this.growthStage = growthStage;
    }
}