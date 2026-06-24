import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        base: "#0b100e",
        card: "#131b17",
        "card-h": "#1a2620",
        accent: "#00e676",
        "accent-dim": "rgba(0,230,118,0.12)",
        warn: "#ff9100",
        danger: "#ff1744",
        t1: "#e0ebe4",
        t2: "#7a9484",
        bdr: "#1e2e25",
      },
      fontFamily: {
        display: ["Space Grotesk", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;