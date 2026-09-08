/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cyber: {
          dark: '#0a0e17',
          bg: '#0a0e17',
          surface: '#0f172a',
          card: '#0f172a',
          cardHover: '#131e36',
          border: '#1e293b',
          borderGlow: '#00ff88',
          green: '#00ff88',
          neon: '#00ff88',
          emerald: '#10b981',
          cyan: '#00e5ff',
          blue: '#3b82f6',
          purple: '#9d4edd',
          amber: '#f59e0b',
          red: '#ef4444',
          muted: '#64748b',
          text: '#f8fafc',
        }
      },
      fontFamily: {
        mono: ['"Fira Code"', 'Consolas', 'Monaco', 'monospace'],
        sans: ['"Outfit"', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'neon-sm': '0 0 10px rgba(0, 255, 136, 0.35)',
        'neon-md': '0 0 20px rgba(0, 255, 136, 0.45)',
        'neon-lg': '0 0 35px rgba(0, 255, 136, 0.6)',
        'neon-green': '0 0 15px rgba(0, 255, 136, 0.45)',
        'neon-cyan': '0 0 15px rgba(0, 229, 255, 0.45)',
        'neon-red': '0 0 15px rgba(239, 68, 68, 0.5)',
        'neon-purple': '0 0 15px rgba(157, 78, 221, 0.45)',
      },
      animation: {
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'scanline': 'scanline 8s linear infinite',
        'flicker': 'flicker 0.15s ease infinite alternate',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(0, 255, 136, 0.2)' },
          '100%': { boxShadow: '0 0 20px rgba(0, 255, 136, 0.6), 0 0 35px rgba(0, 229, 255, 0.4)' },
        },
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(1000%)' },
        }
      }
    },
  },
  plugins: [],
}
