/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./index.html','./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
        },
        bg: { primary: 'var(--bg/primary)', secondary: 'var(--bg/secondary)', tertiary: 'var(--bg/tertiary)', hover: 'var(--bg/hover)' },
        accent: { primary: 'var(--accent/primary)', hover: 'var(--accent/primaryHover)', subtle: 'var(--accent/subtle)', border: 'var(--accent/border)' },
        text: { primary: 'var(--text/primary)', secondary: 'var(--text/secondary)', tertiary: 'var(--text/tertiary)', muted: 'var(--text/muted)' },
        border: { subtle: 'var(--border/subtle)', medium: 'var(--border/medium)', strong: 'var(--border/strong)' },
        state: { success: 'var(--success)', warning: 'var(--warning)', info: 'var(--info)', danger: 'var(--danger)' },
      },
      boxShadow: {
        smx: 'var(--shadow/sm)',
        mdx: 'var(--shadow/md)',
        lgx: 'var(--shadow/lg)',
      },
      borderRadius: { xl2: '14px' },
      fontFamily: { sans: ['Inter','ui-sans-serif','system-ui'] },
    },
  },
  plugins: [],
};
