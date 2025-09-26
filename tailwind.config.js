/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./public/**/*.{html,js}",
    "./*.html"
  ],
  theme: {
    extend: {
      colors: {
        'primary-blue': '#2563EB',
        'primary-cyan': '#06B6D4',
      }
    },
  },
  plugins: [],
}
