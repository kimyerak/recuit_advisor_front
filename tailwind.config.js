/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        kt: {
          red: '#E5001B',
          dark: '#1A1A2E',
          gray: '#F5F5F5',
        },
      },
    },
  },
  plugins: [],
}
