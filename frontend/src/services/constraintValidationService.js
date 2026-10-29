import api from "./api";

export const validateConstraint = async (requestData) => {
    const response = await api.post(
        "/constraintapi/validate",
        requestData
    );

    return response.data;
};