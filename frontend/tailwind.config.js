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
      // Entrance animations. Always applied with the `motion-safe:` variant so
      // users who prefer reduced motion get the final state immediately.
      keyframes: {
        'fade-in-up': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in-scale': {
          from: { opacity: '0', transform: 'scale(0.96)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
      },
      animation: {
        'fade-in-up': 'fade-in-up 0.3s ease-out both',
        'fade-in-scale': 'fade-in-scale 0.5s ease-out both',
      },
    },
  },
  plugins: [],
}
