/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0066CC',
        'primary-dark': '#004499',
        'primary-light': '#E6F2FF',
      },
    },
  },
  plugins: [],
}

