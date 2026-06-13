/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#0B1120',
        surface: '#111A2E',
        raised: '#16213B',
        edge: '#1E2A45',
        accent: {
          DEFAULT: '#3B82F6',
          hover: '#60A5FA',
          deep: '#1D4ED8',
        },
        body: '#CBD5E1',
        heading: '#F1F5F9',
        muted: '#64748B',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
    },
  },
  plugins: [],
}
