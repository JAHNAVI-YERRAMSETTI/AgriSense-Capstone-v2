import api from "./api";

export const getFarmsByFarmerId = async (farmerId) => {
    const response = await api.get(`/farmapi/farmer/${farmerId}`);
    return response.data;
};

export const addFarm = async (farmData) => {
    const response = await api.post("/farmapi/add", farmData);
    return response.data;
};

export const updateFarm = async (id, farmData) => {
    const response = await api.put(
        `/farmapi/update/${id}`,
        farmData
    );
    return response.data;
};

export const deleteFarm = async (id) => {
    const response = await api.delete(
        `/farmapi/delete/${id}`
    );
    return response.data;
};