import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      typography: {
        DEFAULT: {
          css: {
            maxWidth: "none",
            color: "#374151",
            "> p": {
              marginTop: "0.5em",
              marginBottom: "0 !important",
              lineHeight: "1.3",
            },
            "> ul > li": {
              paddingLeft: "1.25em",
              marginTop: "0.125em",
              marginBottom: "0 !important",
              lineHeight: "1.3",
            },
            "> ol > li": {
              paddingLeft: "1.25em",
              marginTop: "0.125em",
              marginBottom: "0 !important",
              lineHeight: "1.3",
            },
            "> h1": {
              fontSize: "1.25em",
              marginTop: "0.5em",
              marginBottom: "0 !important",
              lineHeight: "1.3",
              color: "#374151",
            },
            "> h2": {
              fontSize: "1.15em",
              marginTop: "0.5em !important",
              marginBottom: "0 !important",
              lineHeight: "1.3",
              color: "#374151",
            },
            "> h3": {
              fontSize: "1.05em",
              marginTop: "0.5em",
              marginBottom: "0 !important",
              lineHeight: "1.3",
              color: "#374151",
            },
            code: {
              color: "#6b7280",
              backgroundColor: "#f3f4f6",
              padding: "0.15em 0.3em",
              borderRadius: "0.25em",
              fontSize: "0.875em",
            },
            "> pre": {
              backgroundColor: "#f3f4f6",
              padding: "0.75em",
              borderRadius: "0.375em",
              marginTop: "0.5em",
              marginBottom: "0 !important",
            },
            "pre code": {
              backgroundColor: "transparent",
              padding: "0",
              color: "#374151",
            },
            "> blockquote": {
              borderLeftColor: "#e5e7eb",
              borderLeftWidth: "2px",
              color: "#6b7280",
              fontStyle: "normal",
              marginTop: "0.5em",
              marginBottom: "0 !important",
              paddingLeft: "0.75em",
              lineHeight: "1.5",
            },
            "> hr": {
              marginTop: "0.75em",
              marginBottom: "0 !important",
            },
            a: {
              color: "#2563eb",
              textDecoration: "underline",
              "&:hover": {
                color: "#1d4ed8",
              },
            },
          },
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          1: "hsl(var(--chart-1))",
          2: "hsl(var(--chart-2))",
          3: "hsl(var(--chart-3))",
          4: "hsl(var(--chart-4))",
          5: "hsl(var(--chart-5))",
        },
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
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
} satisfies Config;
