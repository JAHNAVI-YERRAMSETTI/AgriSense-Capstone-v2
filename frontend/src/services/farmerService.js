import api from "./api";

export const getFarmerById = async (id) => {
    const response = await api.get(`/farmerapi/${id}`);
    return response.data;
};

export const updateFarmer = async (id, farmerData) => {
    const response = await api.put(
        `/farmerapi/update/${id}`,
        farmerData
    );

    return response.data;
};