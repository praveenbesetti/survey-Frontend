
/** @type {import('tailwindcss').Config} */
export default {
  content: [
  './index.html',
  './src/**/*.{js,ts,jsx,tsx}'
],
  theme: {
    extend: {
      colors: {
        'bg-primary': '#fafaf8',
        'bg-secondary': '#f0ede6',
        'accent-green': '#16a34a',
        'accent-green-light': '#22c55e',
        'accent-gold': '#f59e0b',
        'accent-warm': '#fbbf24',
        'accent-coral': '#fb7185',
        'text-primary': '#1a1a2e',
        'text-secondary': '#6b7280',
      },
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
