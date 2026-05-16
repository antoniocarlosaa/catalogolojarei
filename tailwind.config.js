/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./contexts/**/*.{js,ts,jsx,tsx}",
    "./App.tsx",
    "./index.tsx"
  ],
  theme: {
    extend: {
      colors: {
          gold: {
              DEFAULT: '#D4AF37',
              light: '#F5E0A3',
              dark: '#AA8A2E',
          },
          background: '#050505',
          surface: '#121212',
          'surface-light': '#1e1e1e',
          whatsapp: '#25D366',
      },
      fontFamily: {
          heading: ['Archivo Black', 'sans-serif'],
          sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
