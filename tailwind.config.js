/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [],
  theme: {
    extend: {
      colors: {
        primary: "#c9d5b5",
        secondary: "#e2dfc9",
      },
      fontFamily: {
        Playwrite: ['"Playwrite NG Modern"'],
        Mountains: ['"Mountains of Christmas"'],
      },
      gridTemplateRows: {
        "where-when": "1fr auto",
      },
      boxShadow: {
        custom: "0 35px 60px -15px #c9d5b5",
      },
    },
  },
  plugins: [],
};
