/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        // Main colors
        'dnd-bg': '#0a0d14',
        'dnd-bg-secondary': '#141b26',
        'dnd-primary': '#c9a227',
        'dnd-secondary': '#8b0000',
        'dnd-accent': '#4a6741',
        'dnd-text': '#e8e0d5',
        'dnd-text-muted': '#8a8478',
        'dnd-border': '#2a3444',
        // Theater colors
        'theater-assault': '#8b4513',
        'theater-siege': '#4a4a4a',
        'theater-portals': '#4b0082',
        'theater-air': '#1e90ff',
      },
      fontFamily: {
        display: ['Cinzel', 'serif'],
        body: ['Source Sans Pro', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out',
        'slide-up': 'slideUp 0.6s ease-out',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
