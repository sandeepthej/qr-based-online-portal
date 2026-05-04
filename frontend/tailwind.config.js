/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          light: '#f3f4f6',
          dark: '#111827',
          primary: '#6366f1',
          secondary: '#a855f7',
        }
      }
    },
  },
  plugins: [],
}
