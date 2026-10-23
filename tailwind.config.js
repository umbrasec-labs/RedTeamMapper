/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Charcoal surfaces (umbrasec.dev palette, pushed one step darker for the map canvas).
        ink: {
          950: '#0c0c0c',
          900: '#111111',
          850: '#161616',
          800: '#1b1b1b',
          750: '#222222',
          700: '#2a2a2a',
          600: '#3a3a3a',
          500: '#525252',
        },
        fog: {
          DEFAULT: '#959c95', // body text
          bright: '#ccd0cf',
          dim: '#7d837d',
          muted: '#686c69',
        },
        // The eight-hue coding set carried over from v3.
        ember: { DEFAULT: '#f25623', soft: '#fb8a5c' }, // primary accent, critical
        gold: '#d9a441', // high, warnings
        khaki: '#aeab94', // medium
        sage: '#88a57d', // low, success
        teal: '#5fb3a1',
        slate: '#8fa3b8', // info
        mauve: '#b48ead',
        rose: '#cf8a78',
      },
      fontFamily: {
        display: ['Syne', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        sans: ['"IBM Plex Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.6875rem', { lineHeight: '1rem' }],
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(242,86,35,0.45), 0 0 24px -4px rgba(242,86,35,0.45)',
        'glow-teal': '0 0 0 1px rgba(95,179,161,0.45), 0 0 24px -4px rgba(95,179,161,0.4)',
        panel: '0 24px 60px -20px rgba(0,0,0,0.8)',
      },
      keyframes: {
        dash: { to: { strokeDashoffset: '-24' } },
        pulseRing: {
          '0%': { opacity: '0.55', transform: 'scale(1)' },
          '100%': { opacity: '0', transform: 'scale(1.18)' },
        },
      },
      animation: {
        dash: 'dash 1.4s linear infinite',
        'pulse-ring': 'pulseRing 2.4s ease-out infinite',
      },
    },
  },
  plugins: [],
};
