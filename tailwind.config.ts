import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Atkinson Hyperlegible", "system-ui", "sans-serif"],
      },
      colors: {
        accessible: {
          black: "#000000",
          white: "#FFFFFF",
          yellow: "#FFD700",
          lime: "#00CC00",
          red: "#E60000",
          blue: "#0066CC",
        },
      },
      spacing: {
        safe: "max(1rem, env(safe-area-inset-bottom))",
        "safe-top": "max(0.75rem, env(safe-area-inset-top))",
        touch: "60px",
      },
      fontSize: {
        base: ["16px", "1.5"],
      },
    },
  },
  plugins: [],
};

export default config;
