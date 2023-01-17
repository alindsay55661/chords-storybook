/** @type {import('tailwindcss').Config} */
module.exports = {
  jit: true,
  content: ['index.html', 'src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      boxShadow: {
        right: '3px 0px 4px -1px rgba(0, 0, 0, 0.2)',
      },
    },
  },
  plugins: [],
}
