import { createContext, useContext, useState } from "react";

import en from "../translations/en";
import te from "../translations/te";
import hi from "../translations/hi";

const LanguageContext = createContext();

const translations = {
    en,
    te,
    hi
};

export const LanguageProvider = ({ children }) => {
    const [language, setLanguage] = useState("en");

    const changeLanguage = (newLanguage) => {
        if (translations[newLanguage]) {
            setLanguage(newLanguage);
        }
    };

    const t = (key) => {
        return translations[language][key] || key;
    };

    return (
        <LanguageContext.Provider
            value={{
                language,
                changeLanguage,
                t
            }}
        >
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    return useContext(LanguageContext);
};