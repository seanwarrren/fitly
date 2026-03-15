import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        dark: {
          950: "#030712",
          900: "#0a0f1e",
          850: "#0f1629",
          800: "#141c33",
          700: "#1a2541",
          600: "#243052",
        },
        accent: {
          DEFAULT: "#06b6d4",
          light: "#22d3ee",
          bright: "#67e8f9",
          glow: "rgba(6, 182, 212, 0.12)",
        },
        purple: {
          glow: "rgba(147, 51, 234, 0.12)",
        },
      },
      boxShadow: {
        "glow-sm": "0 0 15px -3px rgba(6, 182, 212, 0.15)",
        glow: "0 0 25px -5px rgba(6, 182, 212, 0.2)",
        "glow-lg": "0 0 40px -5px rgba(6, 182, 212, 0.25)",
        "glow-purple": "0 0 25px -5px rgba(147, 51, 234, 0.2)",
        "inner-glow": "inset 0 1px 0 0 rgba(255, 255, 255, 0.05)",
      },
      animation: {
        "glow-pulse": "glow-pulse 3s ease-in-out infinite",
        shimmer: "shimmer 2s linear infinite",
        "blob-1": "blob-1 25s ease-in-out infinite",
        "blob-2": "blob-2 30s ease-in-out infinite",
        "blob-3": "blob-3 20s ease-in-out infinite",
        "shine-sweep": "shine-sweep 0.6s ease-out",
        "border-glow": "border-glow 3s ease-in-out infinite",
        "float": "float 6s ease-in-out infinite",
        "pulse-ring": "pulse-ring 2s ease-out infinite",
      },
      keyframes: {
        "glow-pulse": {
          "0%, 100%": { opacity: "0.4" },
          "50%": { opacity: "1" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "blob-1": {
          "0%, 100%": { transform: "translate(0, 0) scale(1)" },
          "33%": { transform: "translate(30px, -40px) scale(1.05)" },
          "66%": { transform: "translate(-20px, 20px) scale(0.95)" },
        },
        "blob-2": {
          "0%, 100%": { transform: "translate(0, 0) scale(1)" },
          "33%": { transform: "translate(-40px, 30px) scale(1.08)" },
          "66%": { transform: "translate(25px, -15px) scale(0.92)" },
        },
        "blob-3": {
          "0%, 100%": { transform: "translate(0, 0) scale(1)" },
          "50%": { transform: "translate(35px, 25px) scale(1.06)" },
        },
        "shine-sweep": {
          "0%": { transform: "translateX(-100%) rotate(12deg)" },
          "100%": { transform: "translateX(100%) rotate(12deg)" },
        },
        "border-glow": {
          "0%, 100%": { opacity: "0.5" },
          "50%": { opacity: "1" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-12px)" },
        },
        "pulse-ring": {
          "0%": { transform: "scale(1)", opacity: "0.6" },
          "100%": { transform: "scale(2)", opacity: "0" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
