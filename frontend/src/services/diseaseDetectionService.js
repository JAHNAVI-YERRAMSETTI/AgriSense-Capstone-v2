import api from "./api";

export const detectDisease = async (farmId, imageFile) => {
    const formData = new FormData();

    formData.append("image", imageFile);

    const response = await api.post(
        `/predictionapi/disease-detection/${farmId}`,
        formData
    );

    return response.data;
};