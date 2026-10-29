import api from "./api";

export const getContextInterpretation = async (farmId) => {
    const response = await api.get(
        `/predictionapi/context/${farmId}`
    );

    return response.data;
};