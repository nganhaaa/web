/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'christmas-red': '#c41e3a',
        'christmas-dark-red': '#8b0000',
        'christmas-green': '#165b33',
        'christmas-light-green': '#228b22',
        'christmas-gold': '#ffd700',
        'christmas-white': '#f8f8f8',
      },
    },
  },
  plugins: [],
}