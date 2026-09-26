/** @type {import('tailwindcss').Config} */

// Semantic colours are CSS variables (RGB channels) defined per theme in
// src/index.css, so every utility (and its `/alpha` modifier) follows the
// active `data-theme` on <html>:
//   dark  — "Trading Card": night teal surfaces, cyan/orange/yellow accents
//   light — "Adventurers' Guild": parchment surfaces, ink/wax/ochre accents
// `brand` holds the fixed logo colours, used where a surface must look the
// same in both themes (the foil of the character card, energy chips).
const themed = (name) => `rgb(var(--color-${name}) / <alpha-value>)`

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: ['selector', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        background: themed('background'),
        surface: themed('surface'),
        raised: themed('raised'),
        edge: themed('edge'),
        accent: {
          DEFAULT: themed('accent'),
          hover: themed('accent-hover'),
          deep: themed('accent-deep'),
        },
        warm: {
          DEFAULT: themed('warm'),
          hover: themed('warm-hover'),
        },
        highlight: themed('highlight'),
        body: themed('body'),
        heading: themed('heading'),
        muted: themed('muted'),
        success: themed('success'),
        danger: themed('danger'),
        card: {
          DEFAULT: themed('card'),
          ink: themed('card-ink'),
          accent: themed('card-accent'),
          muted: themed('card-muted'),
        },
        brand: {
          yellow: '#F4DF6D',
          orange: '#F38C30',
          teal: '#03728B',
          cyan: '#03A9C1',
          cream: '#F4F0F0',
          ink: '#0D1B1F',
        },
      },
      backgroundImage: {
        // Holographic sheen swept across the character card.
        holo: 'linear-gradient(115deg, transparent 25%, rgb(255 255 255 / 0.22) 40%, rgb(244 223 109 / 0.18) 48%, rgb(3 169 193 / 0.18) 56%, transparent 70%)',
        // Darkens the lower half of the portrait so the name stays legible.
        'card-fade':
          'linear-gradient(180deg, transparent 45%, rgb(13 27 31 / 0.95) 85%)',
      },
      fontFamily: {
        sans: ['Barlow', 'system-ui', 'sans-serif'],
        display: ['"Barlow Condensed"', 'Barlow', 'system-ui', 'sans-serif'],
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
