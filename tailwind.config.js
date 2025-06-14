/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Enable dark mode with class-based approach
  theme: {
    extend: {
      colors: {
        // Light mode colors
        light: {
          primary: "#F5F6FF",
          secondary: "#FFFFFF",
          accent: "#F6F8FC",
          elevated: "#EAEFFB",
          text: {
            primary: "#252525",
            secondary: "#6B7280",
          },
          border: "#E0E7EF",
          purple: "#AF42F6",
          teal: "#00CAC3",
        },
        // Dark mode colors
        dark: {
          primary: "#1E1E1E",
          secondary: "#2D2D2D",
          accent: "#3D3D3D",
          elevated: "#121212",
          text: {
            primary: "#FFFFFF",
            secondary: "#E0E0E0",
          },
          border: "#3D3D3D",
          purple: "#AF42F6",
          teal: "#00CAC3",
        },
      },
      boxShadow: {
        'light': '0 10px 30px rgba(0, 0, 0, 0.03)',
        'dark': '0 10px 30px rgba(0, 0, 0, 0.2)',
      },
    },
  },
  plugins: [],
} 