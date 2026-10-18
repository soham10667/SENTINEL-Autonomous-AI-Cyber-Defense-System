/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#f5f0e8",
        "background-secondary": "#ede8dc",
        panel: "#ede8dc",
        "panel-light": "#e8e2d6",
        sidebar: "#e4ddd0",
        border: "#d9d0c0",
        card: "#ede8dc",
        "card-sub": "#e8e2d6",
        canvas: "#f8f5ef",
        mint: {
          DEFAULT: "#10b981",
          hover: "#059669",
          bg: "#d4ede3",
          dark: "#065f46",
        },
        primary: {
          DEFAULT: "#10b981",
          hover: "#059669",
          subtle: "#d4ede3",
        },
        heading: "#2c2825",
        secondary: "#7a6f63",
        threat: {
          critical: "#ef4444",
          high: "#f97316",
          medium: "#eab308",
          low: "#3b82f6",
          safe: "#10b981",
        }
      },
      fontFamily: {
        mono: ["var(--font-mono)", "JetBrains Mono", "Courier New", "monospace"],
        sans: ["var(--font-sans)", "Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
}
