/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: '#B4232A',
        primary: {
          DEFAULT: '#1D4ED8',
          foreground: '#FFFFFF',
        },
        ink: '#1B2430',
        muted: {
          DEFAULT: '#5B6573',
          foreground: '#F6F7F9',
        },
        surface: '#FFFFFF',
        bg: '#F6F7F9',
        border: '#D9DEE5',
        'sla-ok': '#15803D',
        'sla-warn': '#B45309',
        'sla-breach': '#B91C1C',
        info: '#0369A1',
        background: '#F6F7F9',
        foreground: '#1B2430',
        card: '#FFFFFF',
        'card-foreground': '#1B2430',
        ring: '#1D4ED8',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        xl: "8px",
        lg: "8px",
        md: "6px",
        sm: "4px",
      }
    },
  },
  plugins: [],
}
