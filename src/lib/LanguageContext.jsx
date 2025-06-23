import { createContext, useState, useContext, useEffect } from 'react';
import translations from './translations';

// Create a context for language
export const LanguageContext = createContext();

// Custom hook to use the language context
export const useLanguage = () => useContext(LanguageContext);

// Provider component to wrap the app
export const LanguageProvider = ({ children }) => {
    const [language, setLanguage] = useState('English');

    useEffect(() => {
        // Load language setting from localStorage
        const storedLanguage = localStorage.getItem('qcm_language');
        if (storedLanguage) {
            setLanguage(storedLanguage);
        }
    }, []);

    const changeLanguage = (newLanguage) => {
        setLanguage(newLanguage);
        localStorage.setItem('qcm_language', newLanguage);
    };

    // Translate function that will be used throughout the app
    const translate = (text) => {
        if (!text) return '';

        // If translation exists for the current language, return it
        // Otherwise fall back to the original text
        return translations[language]?.[text] || text;
    };

    // Value object to provide through context
    const value = {
        language,
        changeLanguage,
        translate,
        supportedLanguages: Object.keys(translations)
    };

    return (
        <LanguageContext.Provider value={value}>
            {children}
        </LanguageContext.Provider>
    );
}; 