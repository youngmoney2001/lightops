/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      // Polices
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'display': ['36px', { lineHeight: '40px' }],
        'h1': ['30px', { lineHeight: '36px' }],
        'h2': ['24px', { lineHeight: '32px' }],
        'h3': ['20px', { lineHeight: '28px' }],
        'h4': ['18px', { lineHeight: '24px' }],
        'lead': ['16px', { lineHeight: '24px' }],
        'body': ['14px', { lineHeight: '20px' }],
        'small': ['12px', { lineHeight: '16px' }],
      },
      fontWeight: {
        regular: 400,
        medium: 500,
        semibold: 600,
        bold: 700,
      },
      // Couleurs selon la charte
      colors: {
        primary: {
          50: '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA',
          500: '#3B82F6',
          600: '#1A56DB', // Couleur primaire
          700: '#1E40AF',
          800: '#1E3A8A',
          900: '#172554',
        },
        text: {
          primary: '#111827',
          secondary: '#6B7280',
          disabled: '#9CA3AF',
        },
        surface: {
          primary: '#FFFFFF',
          secondary: '#F9FAFB',
          tertiary: '#F3F4F6',
        },
        border: {
          light: '#E5E7EB',
          medium: '#D1D5DB',
          dark: '#9CA3AF',
        },
        status: {
          success: '#10B981',
          warning: '#F59E0B',
          danger: '#EF4444',
          info: '#3B82F6',
        },
        role: {
          'super-admin': '#FBBF24',
          'site-manager': '#1A56DB',
          'veterinary': '#10B981',
          'general-manager': '#8B5CF6',
        }
      },
      // Espacement
      spacing: {
        '0': '0px',
        '1': '4px',
        '2': '8px',
        '3': '12px',
        '4': '16px',
        '5': '20px',
        '6': '24px',
        '8': '32px',
        '10': '40px',
        '12': '48px',
        '16': '64px',
        '20': '80px',
        '24': '96px',
      },
      // Animations
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.2, 1) infinite',
        'slide-in': 'slideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        'fade-in': 'fadeIn 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        'scale-in': 'scaleIn 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
      },
      transitionDuration: {
        'fast': '150ms',
        'normal': '300ms',
        'slow': '500ms',
      },
      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      // Breakpoints personnalisés
      screens: {
        'xs': '480px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
      },
      // Largeurs max des containers
      maxWidth: {
        'container': '1280px',
      },
      // Grid gaps
      gap: {
        'mobile': '16px',
        'desktop': '24px',
      },
    },
  },
  plugins: [],
}
