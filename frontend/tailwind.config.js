import typography from '@tailwindcss/typography';

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        glass: {
          light: 'rgba(255, 255, 255, 0.7)',
          dark: 'rgba(255, 255, 255, 0.4)',
          border: 'rgba(255, 255, 255, 0.5)',
        }
      },
      backgroundImage: {
        'nature': "url('https://images.unsplash.com/photo-1490682143684-14369e18dce8?auto=format&fit=crop&q=80&w=2070')",
      }
    },
  },
  plugins: [
    typography,
  ],
}
