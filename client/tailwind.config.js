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
        crimson: {
          DEFAULT: 'var(--color-crimson, #C4384A)',
          deep: 'var(--color-crimson-deep, #7A1F2B)',
          light: 'var(--color-crimson-light, #FBF1F2)',
          glow: 'rgba(196, 56, 74, 0.25)',
          muted: '#D86372',
        },
        ink: {
          DEFAULT: 'var(--text-primary, #1E2226)',
          deep: 'var(--bg-page, #121518)',
          card: 'var(--bg-card, #1A1E22)',
          light: 'var(--text-secondary, #33383F)',
          muted: 'var(--text-muted, #636C78)',
        },
        porcelain: {
          DEFAULT: 'var(--bg-page, #F7F3EF)',
          card: 'var(--bg-card, #FFFFFF)',
          soft: 'var(--bg-card-subtle, #F2ECE4)',
          dark: '#16191D',
        },
        sage: {
          DEFAULT: 'var(--color-sage, #6E8B7A)',
          deep: 'var(--color-sage-deep, #4E6A5B)',
          light: 'var(--color-sage-light, #EAF0EC)',
          glow: 'rgba(110, 139, 122, 0.25)',
        },
        sand: {
          DEFAULT: 'var(--border-color, #E8DFD3)',
          dark: 'var(--border-subtle, #D5C8B7)',
          light: 'var(--bg-card-subtle, #F2ECE4)',
        },
      },
      fontFamily: {
        display: ['Fraunces', 'Georgia', 'serif'],
        sans: ['Inter', 'Manrope', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      boxShadow: {
        'pulse-glow': '0 0 25px -3px rgba(196, 56, 74, 0.35)',
        'sage-glow': '0 0 25px -3px rgba(110, 139, 122, 0.35)',
        'warm': '0 4px 20px -2px rgba(0, 0, 0, 0.06), 0 2px 6px -1px rgba(0, 0, 0, 0.04)',
        'warm-lg': '0 12px 35px -4px rgba(0, 0, 0, 0.12), 0 4px 12px -2px rgba(0, 0, 0, 0.06)',
        'dark-card': '0 8px 30px rgba(0, 0, 0, 0.4)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'breathing': 'breathing 4s ease-in-out infinite',
        'ecg-draw': 'ecgDraw 2.5s ease-in-out infinite',
        'laser-scan': 'laserScan 2s ease-in-out infinite',
      },
      keyframes: {
        breathing: {
          '0%, 100%': { transform: 'scale(1)', boxShadow: '0 0 15px rgba(196, 56, 74, 0.2)' },
          '50%': { transform: 'scale(1.018)', boxShadow: '0 0 30px rgba(196, 56, 74, 0.45)' },
        },
        laserScan: {
          '0%': { top: '5%', opacity: '0.9' },
          '50%': { top: '92%', opacity: '1' },
          '100%': { top: '5%', opacity: '0.9' },
        },
      },
    },
  },
  plugins: [],
}
