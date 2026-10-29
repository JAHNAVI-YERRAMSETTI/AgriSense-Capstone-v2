import { createContext, useContext, useState } from "react";

import {
    loginFarmer,
    registerFarmer
} from "../services/authService";


const AuthContext = createContext();


const STORAGE_KEY = "agrisense_farmer";


/*
 * Read the saved farmer immediately when the application starts.
 * This prevents ProtectedRoute from thinking the user is logged out
 * during the first render after a page refresh.
 */
const getStoredFarmer = () => {
    try {
        const storedFarmer =
            sessionStorage.getItem(STORAGE_KEY);

        if (!storedFarmer) {
            return null;
        }

        return JSON.parse(storedFarmer);

    } catch (error) {
        console.error(
            "Failed to restore farmer session:",
            error
        );

        sessionStorage.removeItem(STORAGE_KEY);

        return null;
    }
};


export const AuthProvider = ({ children }) => {

    /*
     * Restore session synchronously.
     */
    const [farmer, setFarmer] = useState(
        getStoredFarmer
    );


    /*
     * Since the session is restored synchronously,
     * authentication is ready immediately.
     */
    const [authReady] = useState(true);


    /*
     * Login
     */
    const login = async (email, password) => {

        const response =
            await loginFarmer(email, password);


        if (!response?.success) {
            throw new Error(
                response?.message ||
                "Invalid email or password"
            );
        }


        const farmerData = {
            userId: response.userId,
            name: response.name,
            email: response.email,
            role: response.role,
            phone: response.phone || "",
            location: response.location || ""
        };


        /*
         * Save session.
         */
        sessionStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(farmerData)
        );


        /*
         * Update React state.
         */
        setFarmer(farmerData);


        return response;
    };


    /*
     * Register
     */
    const register = async (farmerData) => {

        const response =
            await registerFarmer(farmerData);


        if (!response?.success) {
            throw new Error(
                response?.message ||
                "Registration failed"
            );
        }


        return response;
    };


    /*
     * Logout
     */
    const logout = () => {

        sessionStorage.removeItem(
            STORAGE_KEY
        );

        setFarmer(null);
    };


    /*
     * Update authenticated farmer information
     * after a profile change.
     */
    const setAuthenticatedFarmer = (farmerData) => {

        sessionStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(farmerData)
        );

        setFarmer(farmerData);
    };


    const value = {
        farmer,
        isLoggedIn: Boolean(farmer),
        authReady,
        login,
        register,
        logout,
        setAuthenticatedFarmer
    };


    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};


export const useAuth = () => {

    const context = useContext(
        AuthContext
    );


    if (!context) {
        throw new Error(
            "useAuth must be used inside AuthProvider"
        );
    }


    return context;
};