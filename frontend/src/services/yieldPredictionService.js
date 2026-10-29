import api from "./api";

export const predictYield = async (farmId) => {
    const response = await api.get(
        `/predictionapi/yield/${farmId}`
    );

    return response.data;
};