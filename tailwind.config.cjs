const colors = require('tailwindcss/colors')

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{svelte,js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        background: "#151d30",
        slate: {
          350: "#b0bccf",
          650: "#3b4a5e",
          750: "#293548",
          775: "#232f42",
          850: "#141d30",
          ...colors.slate
        }
      }
    },
  },
  plugins: [
    require('tailwind-scrollbar'),
  ],
  variants: {
    extend: {
      scrollbar: ["rounded"]
    }
  }
}