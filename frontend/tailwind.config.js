/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: "class", // ✅ مهم للدارك مود
  theme: {
    extend: {
      colors: {
        // ✅ Advanced primary color من CSS variable + يدعم /opacity
        primary: "rgb(var(--primary-rgb) / <alpha-value>)",
      },
    },
  },
  plugins: [],
};
