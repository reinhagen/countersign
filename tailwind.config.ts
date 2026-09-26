import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ivory: "#FAF8F3",
        navy: {
          DEFAULT: "#0B1F3A",
          light: "#16305A",
        },
        gold: {
          DEFAULT: "#B8975A",
          light: "#D4BC8E",
          dark: "#8F7440",
        },
        sage: {
          DEFAULT: "#7A9377",
          bg: "#F1F5EF",
          border: "#D2DFCE",
        },
        amber: {
          DEFAULT: "#B98A3E",
          bg: "#FBF3E4",
          border: "#EAD8B4",
        },
        slate: {
          DEFAULT: "#5A6B84",
          bg: "#EFF2F6",
          border: "#D3DBE5",
        },
        plum: {
          DEFAULT: "#8A5A7A",
          bg: "#F6EEF3",
          border: "#E4D0DE",
        },
        crimson: "#7A2E33",
        // legacy aliases kept during the redesign
        ink: "#0B1F3A",
        parchment: "#FAF8F3",
      },
      fontFamily: {
        serif: ["var(--font-display)", "Georgia", "Cambria", "serif"],
        sans: ["var(--font-body)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      boxShadow: {
        hairline: "0 1px 2px rgba(11, 31, 58, 0.04)",
        card: "0 2px 10px rgba(11, 31, 58, 0.06)",
        lift: "0 8px 24px rgba(11, 31, 58, 0.10)",
      },
      keyframes: {
        "seal-in": {
          "0%": { transform: "scale(0.6)", opacity: "0" },
          "60%": { transform: "scale(1.08)", opacity: "1" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        "gold-shimmer": {
          "0%": { boxShadow: "0 0 0 0 rgba(184, 151, 90, 0.35)" },
          "100%": { boxShadow: "0 0 0 10px rgba(184, 151, 90, 0)" },
        },
        "toast-in": {
          "0%": { transform: "translateY(8px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
      animation: {
        "seal-in": "seal-in 0.45s cubic-bezier(0.22, 1, 0.36, 1)",
        "gold-shimmer": "gold-shimmer 1.1s ease-out",
        "toast-in": "toast-in 0.25s ease-out",
      },
    },
  },
  plugins: [],
};
export default config;
