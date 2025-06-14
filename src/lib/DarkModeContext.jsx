import { createContext, useState, useContext, useEffect } from 'react';

// Create a context for dark mode
export const DarkModeContext = createContext();

// Custom hook to use the dark mode context
export const useDarkMode = () => useContext(DarkModeContext);

// Define consistent color palette for the entire app
export const colorPalette = {
    light: {
        bgPrimary: "#F5F6FF",
        bgSecondary: "#FFFFFF",
        bgAccent: "#F6F8FC",
        bgElevated: "#EAEFFB",
        textPrimary: "#252525",
        textSecondary: "#6B7280",
        borderColor: "#E0E7EF",
        purple: "#AF42F6",
        teal: "#00CAC3",
        success: "#10B981",
        successBg: "rgba(209, 250, 229, 0.8)",
        error: "#DC2626",
        errorBg: "rgba(254, 226, 226, 0.8)",
        warning: "#F59E0B",
        warningBg: "rgba(254, 243, 199, 0.8)",
        info: "#3B82F6",
        infoBg: "rgba(219, 234, 254, 0.8)",
        shadow: "0 10px 30px rgba(0, 0, 0, 0.03)"
    },
    dark: {
        bgPrimary: "#1E1E1E",
        bgSecondary: "#2D2D2D",
        bgAccent: "#3D3D3D",
        bgElevated: "#121212",
        textPrimary: "#FFFFFF",
        textSecondary: "#E0E0E0",
        borderColor: "#3D3D3D",
        purple: "#AF42F6",
        teal: "#00CAC3",
        success: "#34D399",
        successBg: "rgba(6, 78, 59, 0.5)",
        error: "#F87171",
        errorBg: "rgba(153, 27, 27, 0.5)",
        warning: "#FBBF24",
        warningBg: "rgba(120, 53, 15, 0.5)",
        info: "#60A5FA",
        infoBg: "rgba(30, 58, 138, 0.5)",
        shadow: "0 10px 30px rgba(0, 0, 0, 0.2)"
    }
};

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
            document.documentElement.style.backgroundColor = colorPalette.dark.bgElevated;
            document.documentElement.style.color = colorPalette.dark.textPrimary;
        } else {
            document.body.classList.remove('dark');
            document.documentElement.style.backgroundColor = colorPalette.light.bgElevated;
            document.documentElement.style.color = colorPalette.light.textPrimary;
        }
    }, [isDarkMode]);

    const toggleDarkMode = () => {
        const newValue = !isDarkMode;
        setIsDarkMode(newValue);
        localStorage.setItem('qcm_darkMode', JSON.stringify(newValue));
    };

    // Get the current color palette based on dark mode state
    const colors = isDarkMode ? colorPalette.dark : colorPalette.light;

    // Value object to provide through context
    const value = {
        isDarkMode,
        toggleDarkMode,
        colors
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