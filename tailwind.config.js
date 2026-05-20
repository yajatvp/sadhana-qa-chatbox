/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        saffron: {
          50: '#fff8f0',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
        },
        sacred: {
          50: '#fdf4f3',
          100: '#fce7e4',
          200: '#facfc9',
          300: '#f5aca3',
          400: '#ee7d6e',
          500: '#e25643',
          600: '#cf3a26',
          700: '#ae2e1c',
          800: '#90291b',
          900: '#78271d',
        },
      },
    },
  },
  plugins: [],
};
