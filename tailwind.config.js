/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'kids-yellow': '#FFD000',
        'kids-blue': '#4FC3F7',
        'kids-coral': '#FF6B6B',
        'kids-mint': '#00C9A7',
        'kids-purple': '#9B59B6',
      },
      borderRadius: {
        'bubbly': '2rem',
      },
    },
  },
  plugins: [],
};
