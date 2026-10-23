import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        
        // Torres Capitol College Inc. Official Color System
        charcoal: {
          DEFAULT: "#171717",
          primary: "#171717",
          secondary: "#202020",
          surface: "#252525",
          border: "#454545",
          subtle: "#303030",
          text: "#F5F5F5",
          textMuted: "#A6A6A6",
          lightBg: "#F0F0F0",
          lightCard: "#FAFAFA",
          lightText: "#252525",
          lightMuted: "#626262",
          lightBorder: "#E0E0E0",
        },
        burgundy: {
          DEFAULT: "#762D3D",
          hover: "#8A394B",
          pressed: "#622333",
          surface: "#352329",
          subtle: "#422830",
          border: "#5a2531",
          light: "#F8EAEF",
        },
        status: {
          present: "#2F855A",
          presentLight: "#EBF5EE",
          presentDark: "#1C3E2B",
          late: "#B7791F",
          lateLight: "#FEF7E6",
          lateDark: "#483212",
          absent: "#C05656",
          absentLight: "#FDF0F0",
          absentDark: "#4A2020",
          excused: "#4A78A8",
          excusedLight: "#EBF3FB",
          excusedDark: "#1E334A",
          neutral: "#858585",
        },
        // Map slate to the official charcoal, graphite, silver, and soft gray tokens
        slate: {
          50: "#F0F0F0",  // Light-mode page background
          100: "#EAEAEA",
          200: "#E0E0E0", // Light-mode border
          300: "#D4D4D4",
          400: "#A6A6A6", // Secondary text on dark surfaces
          500: "#626262", // Secondary text on light surfaces
          600: "#626262",
          700: "#454545", // Border and divider
          800: "#252525", // Elevated surface
          900: "#202020", // Secondary background / card
          950: "#171717", // Primary dark background
        },
        // Legacy maroon alias mapped strictly to the new Official Burgundy Accent
        maroon: {
          50: "#F8EAEF",
          100: "#F3D8E0",
          200: "#E6B5C2",
          300: "#D3889B",
          400: "#B8576E",
          500: "#8A394B",
          600: "#8A394B",
          700: "#762D3D", // Primary Burgundy
          800: "#622333", // Pressed Burgundy
          900: "#352329", // Subtle Burgundy Surface
          950: "#221419",
        },
        tcc: {
          bg: "#171717",
          secondary: "#202020",
          surface: "#252525",
          border: "#454545",
          subtle: "#303030",
          burgundy: "#762D3D",
          burgundyHover: "#8A394B",
          burgundyPressed: "#622333",
          burgundySurface: "#352329",
          silver: "#A6A6A6",
          lightBg: "#F0F0F0",
          lightCard: "#FAFAFA",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [],
};

export default config;
