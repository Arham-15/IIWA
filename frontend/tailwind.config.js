/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#4f46e5",
          dark: "#3525cd",
          light: "#e0e7ff",
          container: "#4f46e5",
          fixed: "#e2dfff",
        },
        secondary: {
          DEFAULT: "#006c49",
          emerald: "#10b981",
          container: "#6cf8bb",
          fixed: "#6ffbbe",
        },
        tertiary: {
          DEFAULT: "#95002b",
          rose: "#f43f5e",
          container: "#bf0f3c",
          fixed: "#ffdadb",
        },
        surface: {
          DEFAULT: "#ffffff",
          canvas: "#f8fafc",
          container: "#f1f5f9",
          low: "#f8fafc",
          high: "#e2e8f0",
          highest: "#cbd5e1",
        },
        "on-surface": "#0f172a",
        "on-surface-variant": "#475569",
        "on-primary": "#ffffff",
        "on-secondary-container": "#004d34",
        "error-container": "#fee2e2",
        "on-error-container": "#991b1b",
        error: "#dc2626",
      },
      maxWidth: {
        mobile: "480px",
      },
      fontFamily: {
        sans: ["Plus Jakarta Sans", "Inter", "sans-serif"],
        headline: ["Plus Jakarta Sans", "sans-serif"],
      },
    },
  },
  plugins: [],
}
