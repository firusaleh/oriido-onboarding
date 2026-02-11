import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0C0C14",
        surface: "#16161F",
        "surface-hover": "#1C1C28",
        border: "#2A2A38",
        accent: "#FF6B35",
        "accent-hover": "#E85A24",
        primary: "#F0EFE8",
        secondary: "#8A8A9A",
        success: "#22C55E",
        error: "#EF4444",
        info: "#3B82F6",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;