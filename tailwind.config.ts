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
        canvas: "#FBF9F5",
        surface: {
          DEFAULT: "#fff8f5",
          dim: "#e0d9d5",
          bright: "#fff8f5",
          container: {
            lowest: "#ffffff",
            low: "#faf2ee",
            DEFAULT: "#f4ece9",
            high: "#eee7e3",
            highest: "#e8e1dd",
          },
          variant: "#e8e1dd",
          tint: "#a33e05",
        },
        primary: {
          DEFAULT: "#963700",
          container: "#b84d17",
          "on-container": "#ffeee9",
          fixed: "#ffdbcd",
          "fixed-dim": "#ffb597",
          "on-fixed": "#360f00",
          "on-fixed-variant": "#7e2c00",
        },
        secondary: {
          DEFAULT: "#2d694d",
          container: "#aeedca",
          "on-container": "#326e51",
          fixed: "#b1f0cd",
          "fixed-dim": "#96d4b2",
          "on-fixed": "#002113",
          "on-fixed-variant": "#105137",
        },
        tertiary: {
          DEFAULT: "#1f5987",
          container: "#3c72a1",
          "on-container": "#eaf2ff",
          fixed: "#cfe5ff",
          "fixed-dim": "#98cbff",
          "on-fixed": "#001d33",
          "on-fixed-variant": "#024a77",
        },
        error: {
          DEFAULT: "#ba1a1a",
          container: "#ffdad6",
          "on-container": "#93000a",
        },
        hairline: "#E8E0D8",
        charcoal: "#24211F",
        "charcoal-subtle": "#6E655F",
        outline: {
          DEFAULT: "#8b7268",
          variant: "#dec0b5",
        },
        saffron: {
          50: "#fff5ed",
          100: "#ffead4",
          200: "#ffd3a8",
          300: "#ffb471",
          400: "#fd8b37",
          500: "#b84d17",
          600: "#963700",
          700: "#7c2802",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "sans-serif"],
        heading: ["var(--font-jakarta)", "Plus Jakarta Sans", "sans-serif"],
        gujarati: ["var(--font-gujarati)", "Noto Sans Gujarati", "sans-serif"],
      },
      boxShadow: {
        soft: "0 4px 20px -2px rgba(36, 33, 31, 0.04), 0 2px 6px -1px rgba(36, 33, 31, 0.02)",
        subtle: "0 1px 3px rgba(36, 33, 31, 0.05)",
        glass: "0 8px 32px 0 rgba(184, 77, 23, 0.06), inset 0 1px 0 0 rgba(255, 255, 255, 0.6)",
        float: "0 20px 40px -15px rgba(36, 33, 31, 0.08)",
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
