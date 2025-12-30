/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: "1.5rem",
        lg: "2rem",
      },
      screens: {
        "2xl": "80rem",
      },
    },
    extend: {
      fontFamily: {
        sans: ["\"Manrope\"", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["\"Sora\"", "\"Manrope\"", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      colors: {
        brand: {
          50: "#eef6ff",
          100: "#d8e9ff",
          200: "#b8d7ff",
          300: "#8cbfff",
          400: "#5ca0ff",
          500: "#2f7dff",
          600: "#1f63e0",
          700: "#1b4db3",
          800: "#1a4091",
          900: "#18376f",
          950: "#0f2447",
        },
        accent: {
          50: "#ecfdf7",
          100: "#d1faec",
          200: "#a7f3db",
          300: "#6ee7c8",
          400: "#2dd4ad",
          500: "#14b893",
          600: "#0f9376",
          700: "#0d7560",
          800: "#0f5e4d",
          900: "#0f4d40",
          950: "#0b2d25",
        },
      },
      boxShadow: {
        soft: "0 20px 60px -40px rgba(15, 23, 42, 0.45)",
        card: "0 12px 30px -24px rgba(15, 23, 42, 0.4)",
      },
      borderRadius: {
        xl: "0.875rem",
        "2xl": "1.125rem",
        "3xl": "1.5rem",
      },
    },
  },
  plugins: [],
}
