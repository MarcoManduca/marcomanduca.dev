/** @type {import('tailwindcss').Config} */

// Brand palette (dark theme):
//   #03728B blu pastello   #03A9C1 azzurro pastello   #F4DF6D giallo pastello
//   #F38C30 arancione       #F4F0F0 bianco tortora
// Neutrals (background/surface/raised/edge/muted) are derived, tinted toward
// teal for cohesion. `warm` is the CTA accent, `highlight` is for badges/tags.
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#052730',
        surface: '#07323D',
        raised: '#0A3F4C',
        edge: '#14515F',
        accent: {
          DEFAULT: '#03A9C1', // bright cyan: reads well on dark backgrounds
          hover: '#2FC3D6',
          deep: '#03728B',
        },
        warm: {
          DEFAULT: '#F38C30',
          hover: '#F7A455',
        },
        highlight: '#F4DF6D',
        body: '#D6E2E5',
        heading: '#F4F0F0',
        muted: '#6E8A92',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
    },
  },
  plugins: [],
}
