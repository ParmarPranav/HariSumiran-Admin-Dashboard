import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: "#090A0F",
        surface: {
          DEFAULT: "#0F121C",
          dim: "#090A0F",
          bright: "#161B26",
          container: {
            lowest: "#090A0F",
            low: "#11141E",
            DEFAULT: "#161B28",
            high: "#1D2333",
            highest: "#252D40",
          },
          variant: "#1D2333",
          tint: "#F59E0B",
        },
        primary: {
          DEFAULT: "#E8B038",
          container: "#C98B1C",
          "on-container": "#FFFDF5",
          fixed: "#FCE082",
          "fixed-dim": "#E8B038",
          "on-fixed": "#291B00",
          "on-fixed-variant": "#4E3600",
        },
        secondary: {
          DEFAULT: "#10B981",
          container: "#047857",
          "on-container": "#ECFDF5",
          fixed: "#A7F3D0",
          "fixed-dim": "#6EE7B7",
          "on-fixed": "#022C22",
          "on-fixed-variant": "#064E3B",
        },
        tertiary: {
          DEFAULT: "#38BDF8",
          container: "#0284C7",
          "on-container": "#F0F9FF",
          fixed: "#BAE6FD",
          "fixed-dim": "#7DD3FC",
          "on-fixed": "#082F49",
          "on-fixed-variant": "#0C4A6E",
        },
        error: {
          DEFAULT: "#F43F5E",
          container: "#BE123C",
          "on-container": "#FFF1F2",
        },
        hairline: "rgba(255, 255, 255, 0.08)",
        charcoal: "#F3F4F6",
        "charcoal-subtle": "#9CA3AF",
        outline: {
          DEFAULT: "rgba(255, 255, 255, 0.12)",
          variant: "rgba(255, 255, 255, 0.06)",
        },
        saffron: {
          50: "rgba(232, 176, 56, 0.08)",
          100: "rgba(232, 176, 56, 0.15)",
          200: "rgba(232, 176, 56, 0.25)",
          300: "#FCE082",
          400: "#F4C458",
          500: "#E8B038",
          600: "#C98B1C",
          700: "#A06B0E",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "sans-serif"],
        heading: ["var(--font-jakarta)", "Plus Jakarta Sans", "sans-serif"],
        gujarati: ["var(--font-gujarati)", "Noto Sans Gujarati", "sans-serif"],
      },
      boxShadow: {
        soft: "0 4px 20px -2px rgba(0, 0, 0, 0.5), 0 2px 6px -1px rgba(0, 0, 0, 0.3)",
        subtle: "0 1px 3px rgba(0, 0, 0, 0.4)",
        glass: "0 8px 32px 0 rgba(0, 0, 0, 0.45), inset 0 1px 0 0 rgba(255, 255, 255, 0.1)",
        float: "0 20px 40px -15px rgba(0, 0, 0, 0.7)",
        glow: "0 0 24px rgba(232, 176, 56, 0.25)",
        "glow-sm": "0 0 12px rgba(232, 176, 56, 0.2)",
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
    },
  },
  plugins: [],
};

export default config;
