/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        heading: ['Outfit', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
      colors: {
        surface: {
          DEFAULT: '#0f172a',
          light: '#1e293b',
          card: '#1e293b',
          hover: '#334155',
        },
        primary: {
          DEFAULT: '#6366f1',
          light: '#818cf8',
          dark: '#4f46e5',
        },
        accent: {
          DEFAULT: '#f472b6',
          light: '#f9a8d4',
        },
        dim: '#64748b',
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.5rem',
      },
      boxShadow: {
        glow: '0 0 40px rgba(99, 102, 241, 0.15)',
        'glow-lg': '0 0 60px rgba(99, 102, 241, 0.25)',
      },
    },
  },
  plugins: [],
}
