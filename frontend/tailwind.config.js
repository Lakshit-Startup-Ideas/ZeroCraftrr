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
        "2xl": "72rem",
      },
    },
    extend: {
      fontFamily: {
        sans: ["\"IBM Plex Sans\"", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["\"IBM Plex Sans\"", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      colors: {
        surface: {
          DEFAULT: "#f6f7f9",
          subtle: "#eef1f4",
          muted: "#e7ebf0",
          raised: "#ffffff",
        },
        ink: {
          50: "#f8fafc",
          100: "#e2e8f0",
          200: "#cbd5e1",
          300: "#94a3b8",
          400: "#64748b",
          500: "#475569",
          600: "#334155",
          700: "#1f2937",
          800: "#111827",
          900: "#0f172a",
          950: "#0b1220",
        },
        border: "#d7dde5",
        brand: {
          50: "#f2f5f9",
          100: "#e4eaf2",
          200: "#c7d3e3",
          300: "#a2b7cf",
          400: "#7c97b6",
          500: "#5f789a",
          600: "#445e7d",
          700: "#344a63",
          800: "#25364b",
          900: "#1b293b",
          950: "#101a2a",
        },
        accent: {
          50: "#f1f6f7",
          100: "#dfeaec",
          200: "#bfd6db",
          300: "#98b8c2",
          400: "#789dad",
          500: "#5d8193",
          600: "#476675",
          700: "#384f5c",
          800: "#2a3c45",
          900: "#1d2c33",
          950: "#0f181c",
        },
        status: {
          success: "#2f6f64",
          warning: "#8a5b2a",
          danger: "#9b2c2c",
          info: "#3b5a7a",
        },
      },
      boxShadow: {
        soft: "0 18px 40px -32px rgba(15, 23, 42, 0.28)",
        card: "0 1px 2px rgba(15, 23, 42, 0.08), 0 1px 1px rgba(15, 23, 42, 0.04)",
      },
      borderRadius: {
        xl: "0.75rem",
        "2xl": "1rem",
        "3xl": "1.25rem",
      },
    },
  },
  plugins: [],
}
