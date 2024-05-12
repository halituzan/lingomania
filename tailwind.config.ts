import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      keyframes: {
        heartBeat: {
          "0%": { transform: "scale(1);" },
          "50%": { transform: "scale(1.1);" },
          "100%": { transform: "scale(1);" },
        },
        flipHorizontal: {
          "50%": { transform: "rotateY(180deg)" },
        },

        headShake: {
          "0%": {
            transform: "translateX(0)",
          },
          "6.5%": {
            transform: "translateX(-6px) rotateY(-9deg)",
          },

          "18.5%": {
            transform: "translateX(5px) rotateY(7deg)",
          },

          "31.5%": {
            transform: "translateX(-3px) rotateY(-5deg)",
          },

          "43.5%": {
            transform: "translateX(2px) rotateY(3deg)",
          },
          "50%": {
            transform: "translateX(0)",
          },
        },
      },
      animation: {
        heartBeat: "heartBeat 0.5s",
        hflip: "flipHorizontal 0.8s",
        headShake: "headShake 1s",
      },
    },
  },
  plugins: [],
};
export default config;
