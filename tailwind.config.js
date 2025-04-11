/** @type {import('tailwindcss').Config} */
export default {
    content: [
      "./index.html",
      "./src/**/*.{js,jsx,ts,tsx}",
    ],
    theme: {
      extend: {
        colors: {
          spydercoRed: "#990000",
          spydercoGray: "#e0e0e0",
          darkBg: "#121212",
        },
        fontFamily: {
          sans: ['Helvetica Neue', 'Arial', 'sans-serif'],
        },
      },
    },
    plugins: [],
  };
