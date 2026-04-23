import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        page: "#F0EFEA",
        card: "#FAF9F5",
        subtle: "#F2F0EB",
        muted: "#EBE9E3",
        accent: {
          DEFAULT: "#D4713A",
          copper: "#D4A27F",
          blue: "#1A72C7",
          "blue-hover": "#3F8FD9",
        },
        copper: "#D4A27F",
        text: {
          primary: "#141413",
          secondary: "#3D3C39",
          muted: "#737170",
        },
        danger: "#CF222E",
        btn: {
          dark: "#0E0E0E",
        },
        player: {
          red: "#D4713A",
          blue: "#1A72C7",
        },
        border: {
          default: "#DBD9D6",
          subtle: "#E8E7E3",
        },
      },
      borderRadius: {
        pill: "12px",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        serif: ["Georgia", "serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      transitionDuration: {
        DEFAULT: "150ms",
      },
      transitionTimingFunction: {
        DEFAULT: "cubic-bezier(0.4, 0, 0.2, 1)",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
      animation: {
        "fade-in": "fade-in 200ms cubic-bezier(0.4, 0, 0.2, 1)",
      },
    },
  },
  plugins: [animate],
} satisfies Config;
