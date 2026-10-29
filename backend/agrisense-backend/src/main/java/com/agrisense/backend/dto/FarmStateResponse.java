package com.agrisense.backend.dto;

public class FarmStateResponse {

    private Long id;

    private Long farmId;

    private String crop;

    private String growthStage;

    private Double soilMoisture;

    private Double soilPh;

    private Double nitrogen;

    private Double phosphorus;

    private Double potassium;

    private Double temperature;

    private Double humidity;

    private Double rainfall;

    private Double waterAvailable;

    private Integer labourAvailable;

    private Double budgetAvailable;

    private String cropHealth;

    private String diseaseStatus;

    public FarmStateResponse() {
    }

    public FarmStateResponse(
            Long id,
            Long farmId,
            String crop,
            String growthStage,
            Double soilMoisture,
            Double soilPh,
            Double nitrogen,
            Double phosphorus,
            Double potassium,
            Double temperature,
            Double humidity,
            Double rainfall,
            Double waterAvailable,
            Integer labourAvailable,
            Double budgetAvailable,
            String cropHealth,
            String diseaseStatus) {

        this.id = id;
        this.farmId = farmId;
        this.crop = crop;
        this.growthStage = growthStage;
        this.soilMoisture = soilMoisture;
        this.soilPh = soilPh;
        this.nitrogen = nitrogen;
        this.phosphorus = phosphorus;
        this.potassium = potassium;
        this.temperature = temperature;
        this.humidity = humidity;
        this.rainfall = rainfall;
        this.waterAvailable = waterAvailable;
        this.labourAvailable = labourAvailable;
        this.budgetAvailable = budgetAvailable;
        this.cropHealth = cropHealth;
        this.diseaseStatus = diseaseStatus;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getFarmId() {
        return farmId;
    }

    public void setFarmId(Long farmId) {
        this.farmId = farmId;
    }

    public String getCrop() {
        return crop;
    }

    public void setCrop(String crop) {
        this.crop = crop;
    }

    public String getGrowthStage() {
        return growthStage;
    }

    public void setGrowthStage(String growthStage) {
        this.growthStage = growthStage;
    }

    public Double getSoilMoisture() {
        return soilMoisture;
    }

    public void setSoilMoisture(Double soilMoisture) {
        this.soilMoisture = soilMoisture;
    }

    public Double getSoilPh() {
        return soilPh;
    }

    public void setSoilPh(Double soilPh) {
        this.soilPh = soilPh;
    }

    public Double getNitrogen() {
        return nitrogen;
    }

    public void setNitrogen(Double nitrogen) {
        this.nitrogen = nitrogen;
    }

    public Double getPhosphorus() {
        return phosphorus;
    }

    public void setPhosphorus(Double phosphorus) {
        this.phosphorus = phosphorus;
    }

    public Double getPotassium() {
        return potassium;
    }

    public void setPotassium(Double potassium) {
        this.potassium = potassium;
    }

    public Double getTemperature() {
        return temperature;
    }

    public void setTemperature(Double temperature) {
        this.temperature = temperature;
    }

    public Double getHumidity() {
        return humidity;
    }

    public void setHumidity(Double humidity) {
        this.humidity = humidity;
    }

    public Double getRainfall() {
        return rainfall;
    }

    public void setRainfall(Double rainfall) {
        this.rainfall = rainfall;
    }

    public Double getWaterAvailable() {
        return waterAvailable;
    }

    public void setWaterAvailable(Double waterAvailable) {
        this.waterAvailable = waterAvailable;
    }

    public Integer getLabourAvailable() {
        return labourAvailable;
    }

    public void setLabourAvailable(Integer labourAvailable) {
        this.labourAvailable = labourAvailable;
    }

    public Double getBudgetAvailable() {
        return budgetAvailable;
    }

    public void setBudgetAvailable(Double budgetAvailable) {
        this.budgetAvailable = budgetAvailable;
    }

    public String getCropHealth() {
        return cropHealth;
    }

    public void setCropHealth(String cropHealth) {
        this.cropHealth = cropHealth;
    }

    public String getDiseaseStatus() {
        return diseaseStatus;
    }

    public void setDiseaseStatus(String diseaseStatus) {
        this.diseaseStatus = diseaseStatus;
    }
}