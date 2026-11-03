import type { Config } from 'tailwindcss'

const v = (name: string) => `rgb(var(--${name}) / <alpha-value>)`

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: { bg: v('bg'), fg: v('fg'), accent: v('accent'), glow1: v('glow1'), glow2: v('glow2') },
      fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'] },
      fontSize: {
        display: ['clamp(2.6rem, 1rem + 7vw, 7.5rem)', { lineHeight: '0.98', letterSpacing: '-0.045em' }],
        h2: ['clamp(2rem, 1.1rem + 3.4vw, 4.25rem)', { lineHeight: '1.04', letterSpacing: '-0.035em' }],
        lead: ['clamp(1.05rem, 0.95rem + 0.5vw, 1.35rem)', { lineHeight: '1.6' }],
      },
      maxWidth: { site: '1200px' },
      keyframes: {
        drift: { '0%,100%': { transform: 'translate3d(0,0,0) scale(1)' }, '50%': { transform: 'translate3d(6%,4%,0) scale(1.12)' } },
        scroll: { '0%': { transform: 'translateY(0)', opacity: '0' }, '30%': { opacity: '1' }, '100%': { transform: 'translateY(14px)', opacity: '0' } },
      },
      animation: { drift: 'drift 22s ease-in-out infinite', scroll: 'scroll 1.8s ease-in-out infinite' },
    },
  },
  plugins: [],
} satisfies Config
