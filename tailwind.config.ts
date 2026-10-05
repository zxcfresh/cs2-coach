import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cs2: {
          dark: "#09090b",
          darker: "#050506",
          card: "#18181b",
          border: "#27272a",
          orange: "#f97316",
          "orange-light": "#fb923c",
          green: "#22c55e",
          red: "#ef4444",
          blue: "#3b82f6",
          muted: "#a1a1aa",
          zinc: "#71717a",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        "glow-orange": "0 0 40px rgba(249, 115, 22, 0.15)",
        "glow-sm": "0 0 20px rgba(249, 115, 22, 0.1)",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [],
};

export default config;
