
import api from "./api";

export const getCropRecommendation = async (farmId) => {
    const response = await api.get(
        `/predictionapi/crop-recommendation/${farmId}`
    );

    return response.data;
};

export const getRiskAnalysis = async (farmId) => {
    const response = await api.get(
        `/predictionapi/risk-analysis/${farmId}`
    );

    return response.data;
};
