/** @type {import('tailwindcss').Config} */

const calc = (num) => `calc(${num} * var(--srem))`;

export default {
  content: ["./src/**/*.{html,js,ts,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [],
};
