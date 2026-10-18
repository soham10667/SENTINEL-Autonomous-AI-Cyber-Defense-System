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
        pink: {
          primary: "#00d4ff",
          pastel: "#00b4d8",
          blush: "#0077a8",
          button: "#0096c7",
          hover: "#00b4d8",
          active: "#003d5c",
          border: "#1e2d47",
        },
        main: "#e2e8f0",
        secondary: "#94a3b8",
        // Cyan neon accent tokens for dark cyber theme
        cyan: {
          50: "#e0f9ff",
          100: "#b3f0ff",
          200: "#80e5ff",
          300: "#4dd9ff",
          400: "#00d4ff",
          500: "#00b4d8",
          600: "#0096c7",
          950: "#080d1a",
          neon: "#00d4ff",
        },
        threat: {
          critical: "#ef4444",
          high: "#f97316",
          medium: "#eab308",
          low: "#3b82f6",
          safe: "#10b981",
        }
      },
      boxShadow: {
        'pink-subtle': '0 2px 10px rgba(0, 212, 255, 0.08), 0 1px 3px rgba(0, 180, 216, 0.05)',
        'pink-card': '0 4px 20px -2px rgba(0, 212, 255, 0.1), 0 2px 6px -1px rgba(0, 180, 216, 0.07)',
        'pink-hover': '0 8px 25px -4px rgba(0, 212, 255, 0.2), 0 3px 8px -2px rgba(0, 180, 216, 0.12)',
        'pink-btn': '0 4px 14px rgba(0, 150, 199, 0.4)',
      },
      fontFamily: {
        mono: ["var(--font-mono)", "JetBrains Mono", "Courier New", "monospace"],
        sans: ["var(--font-sans)", "Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
}
