import api from "./api";

export const getFarmStateByFarmId = async (farmId) => {
    const response = await api.get(
        `/farmstateapi/farm/${farmId}`
    );

    return response.data;
};

export const addFarmState = async (farmStateData) => {
    const response = await api.post(
        "/farmstateapi/add",
        farmStateData
    );

    return response.data;
};

export const updateFarmState = async (
    id,
    farmStateData
) => {
    const response = await api.put(
        `/farmstateapi/update/${id}`,
        farmStateData
    );

    return response.data;
};