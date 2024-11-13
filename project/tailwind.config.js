/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#f0f3f9',
          100: '#dce2f0',
          200: '#bbc7e3',
          300: '#92a4d1',
          400: '#6b7fbc',
          500: '#4f63a7',
          600: '#3B4262', // Primary navy
          700: '#363c59',
          800: '#2d3249',
          900: '#272b3d',
          950: '#151721',
        }
      },
      fontFamily: {
        display: ['Funnel Display', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fade-in 0.3s ease-out',
        'slide-in-from-top': 'slide-in-from-top 0.3s ease-out',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-in-from-top': {
          '0%': { transform: 'translateY(-1rem)' },
          '100%': { transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};