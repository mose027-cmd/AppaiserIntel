import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          navy: "#0f2a44",
          blue: "#2563eb",
          light: "#f6f8fb",
          slate: "#334155"
        }
      }
    },
  },
  plugins: [],
};
export default config;
