import api from "./api";

export const getAllAgriculturalActions = async () => {
    const response = await api.get("/agricultureactionapi/viewall");
    return response.data;
};

export const getActiveAgriculturalActions = async () => {
    const response = await api.get("/agricultureactionapi/active");
    return response.data;
};

export const getActionsForFarm = async (crop, growthStage) => {
    const response = await api.get("/agricultureactionapi/farm", {
        params: {
            crop,
            growthStage,
        },
    });

    return response.data;
};

export const addAgriculturalAction = async (actionData) => {
    const response = await api.post(
        "/agricultureactionapi/add",
        actionData
    );

    return response.data;
};