/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#f6f1e7',
        panel: '#fffdf8',
        panel2: '#efe8da',
        line: '#ded3c1',
        mint: '#a9472f',
        forest: '#244436',
        muted: '#756e61',
        rose: {
          300: '#a9473f',
          400: '#a9473f'
        }
      },
      boxShadow: { glow: '0 8px 24px rgba(169,71,47,.2)' }
    }
  },
  plugins: []
}