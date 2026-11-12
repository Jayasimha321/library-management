/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          50: '#FDFBF7',
          100: '#F9F5EC',
          200: '#F4ECE1',
          300: '#EBDDC9',
          400: '#DFC8A8',
        },
        clay: {
          900: '#1C1D21',
          800: '#282A30',
          700: '#383B44',
          600: '#525663',
        },
        amberGold: {
          DEFAULT: '#F5C451',
          light: '#FDEBB3',
          dark: '#D99F26',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '3xl': '1.75rem',
        '4xl': '2.25rem',
      }
    },
  },
  plugins: [],
}
