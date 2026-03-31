import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        void: '#050508',
        obsidian: '#0d0d14',
        surface: '#12121c',
        elevated: '#1a1a28',
        border: '#252535',
        muted: '#3a3a55',
        dim: '#6b6b8a',
        prose: '#b8b8d0',
        bright: '#e8e8f5',
        pure: '#ffffff',
        neon: {
          cyan: '#00f5ff',
          violet: '#7c3aed',
          pink: '#ff006e',
          amber: '#ffbe0b',
          green: '#06d6a0',
        },
        rank: {
          gold: '#ffd700',
          silver: '#c0c0c0',
          bronze: '#cd7f32',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'sans-serif'],
        body: ['var(--font-body)', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      backgroundImage: {
        'grid-pattern': "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='32' height='32' fill='none' stroke='rgb(255 255 255 / 0.04)'%3e%3cpath d='M0 .5H31.5V32'/%3e%3c/svg%3e\")",
        'noise': "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.05'/%3E%3C/svg%3E\")",
        'glow-cyan': 'radial-gradient(ellipse at center, rgba(0,245,255,0.15) 0%, transparent 70%)',
        'glow-violet': 'radial-gradient(ellipse at center, rgba(124,58,237,0.2) 0%, transparent 70%)',
        'card-shine': 'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0) 60%)',
      },
      boxShadow: {
        'neon-cyan': '0 0 20px rgba(0,245,255,0.3), 0 0 60px rgba(0,245,255,0.1)',
        'neon-violet': '0 0 20px rgba(124,58,237,0.4), 0 0 60px rgba(124,58,237,0.15)',
        'neon-pink': '0 0 20px rgba(255,0,110,0.3), 0 0 60px rgba(255,0,110,0.1)',
        'card': '0 4px 24px rgba(0,0,0,0.4), 0 1px 0 rgba(255,255,255,0.05)',
        'card-hover': '0 8px 48px rgba(0,0,0,0.5), 0 1px 0 rgba(255,255,255,0.08)',
        'rank-gold': '0 0 30px rgba(255,215,0,0.35)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4,0,0.6,1) infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'slide-up': 'slideUp 0.5s ease-out forwards',
        'fade-in': 'fadeIn 0.4s ease-out forwards',
        'rank-glow': 'rankGlow 2s ease-in-out infinite',
        'ticker': 'ticker 20s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        rankGlow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(255,215,0,0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(255,215,0,0.6)' },
        },
        ticker: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
    },
  },
  plugins: [],
}

export default config
