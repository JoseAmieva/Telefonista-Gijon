/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"DM Sans"', "system-ui", "sans-serif"],
        display: ['"Libre Baskerville"', "Georgia", "serif"],
      },
      colors: {
        central: {
          bg: "#EDE8DC",
          navy: "#1A3348",
          amber: "#B87420",
          amberBg: "#FDF2DC",
          border: "#D6CCBA",
          muted: "#7A8898",
          text: "#263240",
        },
      },
      boxShadow: {
        card: "0 2px 18px rgba(26,51,72,0.08)",
      },
    },
  },
  plugins: [],
};
