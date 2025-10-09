import typography from '@tailwindcss/typography';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Google Material Design colors
        primary: {
          DEFAULT: '#4285f4',
          foreground: '#ffffff',
        },
        secondary: {
          DEFAULT: '#f8f9fa',
          foreground: '#202124',
        },
        destructive: {
          DEFAULT: '#ea4335',
          foreground: '#ffffff',
        },
        muted: {
          DEFAULT: '#f1f3f4',
          foreground: '#5f6368',
        },
        accent: {
          DEFAULT: '#e8f0fe',
          foreground: '#1967d2',
        },
        border: '#dadce0',
        input: '#ffffff',
        ring: '#4285f4',
        background: '#ffffff',
        foreground: '#202124',
        card: {
          DEFAULT: '#ffffff',
          foreground: '#202124',
        },
        'google-blue': '#4285f4',
        'google-green': '#34a853',
        'google-yellow': '#fbbc05',
        'google-red': '#ea4335',
      },
      fontFamily: {
        sans: ['Inter', 'Roboto', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Consolas', 'monospace'],
      },
      borderRadius: {
        lg: '0.5rem',
        md: '0.375rem',
        sm: '0.25rem',
      },
      boxShadow: {
        'google-sm':
          '0 1px 2px 0 rgba(60,64,67,0.3), 0 1px 3px 1px rgba(60,64,67,0.15)',
        'google-md':
          '0 1px 2px 0 rgba(60,64,67,0.3), 0 2px 6px 2px rgba(60,64,67,0.15)',
        'google-lg':
          '0 1px 3px 0 rgba(60,64,67,0.3), 0 4px 8px 3px rgba(60,64,67,0.15)',
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-in': 'slideIn 0.3s ease-out',
        'pulse-slow': 'pulse 3s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      spacing: {
        18: '4.5rem',
        88: '22rem',
      },
    },
  },
  plugins: [typography],
};
