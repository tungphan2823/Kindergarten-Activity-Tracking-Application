/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      backgroundImage: {
        kindergarten: "./src/assets/kin.jpg",
      },
      colors: {
        yellowOrange: "#FEEED7",
        greenBlur: "#0DF667",
        blueM: "#1C83E4",
        textBlue: "#006CAF",
        yellowGuest: "#FFF700",
        yellowText: "#E1A626",
      },
      keyframes: {
        "fade-in-down": {
          "0%": {
            opacity: "0",
            transform: "translateY(-10px)",
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0)",
          },
        },
      },
      animation: {
        "fade-in-down": "fade-in-down 0.5s ease-out",
      },
    },
  },
  plugins: [],
};
