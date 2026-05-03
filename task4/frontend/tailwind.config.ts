import type { Config } from 'tailwindcss'
import animate from 'tailwindcss-animate'

const config = {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: '1rem',
        sm: '1.5rem',
        lg: '3rem',
      },
      screens: {
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1120px',
        '2xl': '1180px',
      },
    },
    extend: {
      colors: {
        background: 'hsl(var(--bg-page) / <alpha-value>)',
        page: {
          DEFAULT: 'hsl(var(--bg-page) / <alpha-value>)',
          alt: 'hsl(var(--bg-page-alt) / <alpha-value>)',
        },
        card: {
          DEFAULT: 'hsl(var(--bg-card) / <alpha-value>)',
          elevated: 'hsl(var(--bg-elevated) / <alpha-value>)',
          muted: 'hsl(var(--bg-muted) / <alpha-value>)',
        },
        popover: {
          DEFAULT: 'hsl(var(--bg-elevated) / <alpha-value>)',
          foreground: 'hsl(var(--text) / <alpha-value>)',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent) / <alpha-value>)',
          hover: 'hsl(var(--accent-hover) / <alpha-value>)',
          soft: 'hsl(var(--accent-soft) / <alpha-value>)',
          foreground: 'hsl(var(--accent-fg) / <alpha-value>)',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary) / <alpha-value>)',
          foreground: 'hsl(var(--primary-fg) / <alpha-value>)',
        },
        secondary: {
          DEFAULT: 'hsl(var(--bg-card) / <alpha-value>)',
          foreground: 'hsl(var(--text) / <alpha-value>)',
        },
        foreground: 'hsl(var(--text) / <alpha-value>)',
        muted: {
          DEFAULT: 'hsl(var(--bg-muted) / <alpha-value>)',
          foreground: 'hsl(var(--text-muted) / <alpha-value>)',
        },
        border: 'hsl(var(--border) / <alpha-value>)',
        input: 'hsl(var(--border-input) / <alpha-value>)',
        ring: 'hsl(var(--ring) / <alpha-value>)',
        destructive: {
          DEFAULT: 'hsl(var(--danger) / <alpha-value>)',
          foreground: 'hsl(var(--danger-fg) / <alpha-value>)',
        },
        link: {
          DEFAULT: 'hsl(var(--link) / <alpha-value>)',
          hover: 'hsl(var(--link-hover) / <alpha-value>)',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)'],
        display: ['var(--font-display)'],
        mono: ['var(--font-mono)'],
      },
      borderRadius: {
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)',
        '2xl': 'var(--radius-2xl)',
      },
      boxShadow: {
        ring: 'var(--shadow-ring)',
        sm: 'var(--shadow-sm)',
        md: 'var(--shadow-md)',
      },
    },
  },
  plugins: [animate],
} satisfies Config

export default config
