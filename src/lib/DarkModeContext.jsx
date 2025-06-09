import { createContext, useState, useContext, useEffect } from 'react';

// Create a context for dark mode
export const DarkModeContext = createContext();

// Custom hook to use the dark mode context
export const useDarkMode = () => useContext(DarkModeContext);

// Provider component to wrap the app
export const DarkModeProvider = ({ children }) => {
    const [isDarkMode, setIsDarkMode] = useState(false);

    useEffect(() => {
        // Load dark mode setting from localStorage
        const storedDarkMode = localStorage.getItem('qcm_darkMode');
        if (storedDarkMode !== null) {
            setIsDarkMode(JSON.parse(storedDarkMode));
        }
    }, []);

    useEffect(() => {
        if (isDarkMode) {
            document.body.classList.add('dark');
        } else {
            document.body.classList.remove('dark');
        }
    }, [isDarkMode]);

    const toggleDarkMode = () => {
        const newValue = !isDarkMode;
        setIsDarkMode(newValue);
        localStorage.setItem('qcm_darkMode', JSON.stringify(newValue));
    };

    // Value object to provide through context
    const value = {
        isDarkMode,
        toggleDarkMode
    };

    return (
        <DarkModeContext.Provider value={value}>
            {children}
        </DarkModeContext.Provider>
    );
};

// Color utility function
export const getColor = (lightColor, darkColor) => {
    // This will be used with the useDarkMode hook
    const { isDarkMode } = useDarkMode();
    return isDarkMode ? darkColor : lightColor;
}; 