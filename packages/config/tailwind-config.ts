import type { Config } from 'tailwindcss'

export default {
  darkMode: ['class'],
  content: [
    '../../apps/web/src/**/*.{ts,tsx}',
    '../ui/src/**/*.{ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        ink: '#0A0A0B',
        paper: '#FFFFFF',
        slate700: '#1E2128',
        slate500: '#3C4250',
        blue900: '#0B1220',
        blue800: '#0F1A2B',
        blue700: '#12203A',
        blue600: '#17325C',
        green700: '#0E4F3D',
        green600: '#156A54',
        green500: '#1E8A6D',
        glass: '#FFFFFFB3'
      },
      boxShadow: {
        card: '0 6px 24px rgba(0,0,0,0.25)'
      },
      borderRadius: {
        xl2: '1.25rem'
      }
    }
  },
  plugins: []
} satisfies Config
