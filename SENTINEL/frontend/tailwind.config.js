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
        background: "#FFFFFF",
        "background-secondary": "#FFF9FC",
        panel: "#FFFFFF",
        "panel-light": "#FFF9FC",
        sidebar: "#FFF7FA",
        border: "#F5E1E9",
        pink: {
          primary: "#F4A7C1",
          pastel: "#FBCFE8",
          blush: "#FCE7F3",
          button: "#E88DAD",
          hover: "#D9769B",
          active: "#FCE7F3",
          border: "#F5E1E9",
        },
        main: "#29252A",
        secondary: "#77717A",
        // Map legacy cyan tokens to soft pink palette
        cyan: {
          50: "#FFF5F8",
          100: "#FCE7F3",
          200: "#FBCFE8",
          300: "#F9A8D4",
          400: "#F4A7C1",
          500: "#E88DAD",
          600: "#D9769B",
          950: "#FFF7FA",
          neon: "#E88DAD",
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
        'pink-subtle': '0 2px 10px rgba(244, 167, 193, 0.12), 0 1px 3px rgba(244, 167, 193, 0.08)',
        'pink-card': '0 4px 20px -2px rgba(244, 167, 193, 0.15), 0 2px 6px -1px rgba(244, 167, 193, 0.1)',
        'pink-hover': '0 8px 25px -4px rgba(244, 167, 193, 0.25), 0 3px 8px -2px rgba(244, 167, 193, 0.15)',
        'pink-btn': '0 4px 14px rgba(232, 141, 173, 0.35)',
      },
      fontFamily: {
        mono: ["var(--font-mono)", "JetBrains Mono", "Courier New", "monospace"],
        sans: ["var(--font-sans)", "Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
}
