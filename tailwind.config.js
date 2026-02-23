/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#0D9488",
          light: "#14B8A6",
          dark: "#0F766E",
          50: "#F0FDFA",
          100: "#CCFBF1",
          200: "#99F6E4",
          500: "#0D9488",
          600: "#0F766E",
          700: "#115E59",
        },
        ocean: {
          DEFAULT: "#0891B2",
          light: "#06B6D4",
          dark: "#0E7490",
        },
        amber: {
          DEFAULT: "#F59E0B",
          light: "#FBBF24",
          dark: "#D97706",
          600: "#D97706",
        },
        surface: {
          DEFAULT: "#FFFFFF",
          50: "#F8FAFC",
          100: "#F1F5F9",
          200: "#E2E8F0",
          300: "#CBD5E1",
        },
      },
      fontFamily: {
        display: ["Outfit", "sans-serif"],
        body: ["Source Sans 3", "sans-serif"],
      },
      keyframes: {
        fadeSlideUp: {
          from: { opacity: "0", transform: "translateY(16px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        skeletonPulse: {
          "0%, 100%": { opacity: "0.5" },
          "50%": { opacity: "0.85" },
        },
        spin: {
          to: { transform: "rotate(360deg)" },
        },
      },
      animation: {
        fadeSlideUp: "fadeSlideUp 0.45s ease-out both",
        skeleton: "skeletonPulse 1.8s ease-in-out infinite",
        spin: "spin 0.8s linear infinite",
      },
    },
  },
  plugins: [],
};
