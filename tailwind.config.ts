import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#FAF9F6",
        surface: "#FFFFFF",
        "surface-soft": "#F3F1EC",
        ink: "#16161A",
        "ink-soft": "#5B5A56",
        "ink-faint": "#9C9A93",
        primary: "#123526",
        "primary-hover": "#0D2B1D",
        amber: "#92620A",
        "amber-bg": "#FCEFD8",
        teal: "#0F6E56",
        "teal-bg": "#DFF4EC",
        coral: "#B23A24",
        "coral-bg": "#FCE8E3",
        blue: "#1D4ED8",
        "blue-bg": "#E6EEFC",
        "monei-navy": "#1E4B78",
        "monei-navy-deep": "#0F2038",
        "monei-navy-darker": "#090E1A",
      },
      borderColor: {
        DEFAULT: "#E8E5DD",
        soft: "#E8E5DD",
      },
      fontFamily: {
        sans: ["var(--font-instrument)", "sans-serif"],
        mono: ["var(--font-plex-mono)", "monospace"],
      },
      keyframes: {
        "chip-in": {
          from: { opacity: "0", transform: "scale(0.9)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        "card-in": {
          from: { opacity: "0", transform: "translateY(10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "msg-in": {
          from: { opacity: "0", transform: "translateY(6px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "pulse-soft": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.45" },
        },
        blink: {
          "0%, 45%": { opacity: "1" },
          "50%, 95%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        shake: {
          "0%, 100%": { transform: "translateX(0)" },
          "20%": { transform: "translateX(-8px)" },
          "40%": { transform: "translateX(8px)" },
          "60%": { transform: "translateX(-6px)" },
          "80%": { transform: "translateX(6px)" },
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        "glow-soft": {
          "0%, 100%": { opacity: "0.5", transform: "scale(1)" },
          "50%": { opacity: "0.8", transform: "scale(1.06)" },
        },
      },
      animation: {
        "chip-in": "chip-in 0.25s cubic-bezier(0.16,1,0.3,1) both",
        "card-in": "card-in 0.35s cubic-bezier(0.16,1,0.3,1) both",
        "msg-in": "msg-in 0.3s cubic-bezier(0.16,1,0.3,1) both",
        "pulse-soft": "pulse-soft 1.1s ease-in-out infinite",
        blink: "blink 0.9s step-end infinite",
        shake: "shake 0.4s ease-in-out",
        marquee: "marquee 28s linear infinite",
        "glow-soft": "glow-soft 3.5s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;