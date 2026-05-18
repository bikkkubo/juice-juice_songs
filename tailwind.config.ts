import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#FFF8F2",
        surface: "#F6F2EB",
        ink: "#2B2A28",
        "ink-weak": "#6E655E",
        accent: "#C86F5E",
        "accent-soft": "#EBB8AB",
        border: "#E7E2DA",
        type: {
          indie: "#A78BFA",
          single: "#EB5A8C",
          album: "#22C55E",
          digital: "#38BDF8",
          unreleased: "#64748B",
        },
        member: {
          apple: "#FF6881",
          peach: "#FFC1E0",
          acai: "#7C4DFF",
          lemon: "#FFE066",
          grape: "#A855F7",
        },
      },
      fontFamily: {
        sans: [
          "var(--font-noto)",
          "Hiragino Sans",
          "system-ui",
          "sans-serif",
        ],
        mono: ["var(--font-inter)", "ui-monospace", "monospace"],
      },
      maxWidth: {
        page: "720px",
      },
    },
  },
  plugins: [],
};

export default config;
