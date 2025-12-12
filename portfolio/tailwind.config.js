/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./app/**/*.{js,ts,jsx,tsx}",
      "./components/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
      extend: {
        fontFamily: {
          cinzel: ["var(--font-cinzel)", "serif"],
          cormorant: ["var(--font-cormorant-sc)", "serif"],
        },
      },
    },
    plugins: [],
  };
  