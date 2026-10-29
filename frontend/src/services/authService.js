import api from "./api";

export const loginFarmer = async (email, password) => {
    const response = await api.post("/farmerapi/login", {
        email,
        password
    });

    return response.data;
};

export const registerFarmer = async (farmerData) => {
    const response = await api.post("/farmerapi/register", farmerData);

    return response.data;
};