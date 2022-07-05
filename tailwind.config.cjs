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
        background: "#0f172a",
        slate: {
          750: "#293548",
          ...colors.slate
        }
      }
    },
  },
  plugins: [
    require("tailwind-scrollbar")
  ],
  variants: {
    extend: {
      scrollbar: ["rounded"]
    }
  }
}
