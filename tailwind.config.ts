import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./next.config.ts",
    "./README.md",
  ],
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))'
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))'
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))'
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))'
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))'
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))'
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))'
        },
        
        // Conversion.ai Inspired Color Palette
        conv: {
          // Primary Colors
          primary: '#3A8B8C',
          'primary-hover': '#2D7374',
          'primary-active': '#246263',
          'primary-light': 'rgba(58, 139, 140, 0.1)',
          
          // Neutral Colors
          white: '#FFFFFF',
          background: '#F8F8F8',
          'background-alt': '#F0F0F0',
          surface: '#FFFFFF',
          
          // Text Colors
          'text-primary': '#1A1A1A',
          'text-secondary': '#666666',
          'text-muted': '#999999',
          
          // Border Colors
          border: '#E5E5E5',
          'border-light': '#EEEEEE',
          
          // Section Backgrounds
          'section-mint': '#E8F5F5',
          'section-sage': '#E5F0E8',
          'section-announcement': '#2D2D2D',
          
          // Semantic Colors
          success: '#22C55E',
          warning: '#F59E0B',
          error: '#EF4444',
          info: '#3B82F6',
          
          // Badge Colors
          purple: '#8B5CF6',
          teal: '#14B8A6',
          orange: '#F97316',
          pink: '#EC4899',
        },
        
        // Legacy colors (for backward compatibility)
        conversion: {
          white: '#FFFFFF',
          beige: '#F8F8F8',
          black: '#000000',
          charcoal: '#1A1A1A',
          'card-hover': '#272724',
          green: '#22C55E',
          purple: '#8B5CF6',
          red: '#EF4444',
          blue: '#3A8B8C',
          'dark-blue': '#2D7374',
          border: {
            light: '#E5E5E5',
            dark: '#3C3B37'
          }
        },
        
        sidebar: {
          DEFAULT: 'hsl(var(--sidebar-background))',
          foreground: 'hsl(var(--sidebar-foreground))',
          primary: 'hsl(var(--sidebar-primary))',
          'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
          accent: 'hsl(var(--sidebar-accent))',
          'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
          border: 'hsl(var(--sidebar-border))',
          ring: 'hsl(var(--sidebar-ring))'
        }
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
        xl: 'calc(var(--radius) + 4px)',
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)'
      },
      fontFamily: {
        sans: [
          'Inter', 
          'var(--font-geist-sans)',
          'system-ui',
          'sans-serif'
        ],
        serif: [
          'Playfair Display',
          'Georgia',
          'Times New Roman',
          'serif'
        ],
        mono: [
          'var(--font-geist-mono)',
          'SF Mono',
          'Fira Code',
          'monospace'
        ]
      },
      fontSize: {
        'hero': ['5rem', { lineHeight: '1.1', letterSpacing: '-0.025em' }],
        '5xl': ['3rem', { lineHeight: '1.1', letterSpacing: '-0.025em' }],
        '4xl': ['2.25rem', { lineHeight: '1.2', letterSpacing: '-0.02em' }],
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
      },
      maxWidth: {
        '8xl': '88rem',
        '9xl': '96rem',
      },
      boxShadow: {
        'card': '0 4px 24px -2px rgba(0, 0, 0, 0.08)',
        'card-hover': '0 8px 32px -4px rgba(0, 0, 0, 0.12)',
        'card-elevated': '0 10px 40px -8px rgba(0, 0, 0, 0.15)',
        'button': '0 2px 8px 0 rgba(58, 139, 140, 0.25)',
        'button-hover': '0 4px 16px 0 rgba(58, 139, 140, 0.35)',
        'soft-card': '0 15px 35px rgba(24, 34, 63, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.04)'
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' }
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' }
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' }
        },
        'fade-in-up': {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' }
        },
        'fade-in-down': {
          from: { opacity: '0', transform: 'translateY(-20px)' },
          to: { opacity: '1', transform: 'translateY(0)' }
        },
        'slide-in-left': {
          from: { opacity: '0', transform: 'translateX(-30px)' },
          to: { opacity: '1', transform: 'translateX(0)' }
        },
        'slide-in-right': {
          from: { opacity: '0', transform: 'translateX(30px)' },
          to: { opacity: '1', transform: 'translateX(0)' }
        },
        'scale-in': {
          from: { opacity: '0', transform: 'scale(0.95)' },
          to: { opacity: '1', transform: 'scale(1)' }
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' }
        },
        'pulse-subtle': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' }
        },
        'scroll-logos': {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-100%)' }
        },
        'fade-up': {
          '0%': { transform: 'translate3d(0, 1.5rem, 0)', opacity: '0' },
          '100%': { transform: 'translate3d(0, 0, 0)', opacity: '1' }
        },
        'scan': {
          '0%, 100%': { top: '0%' },
          '50%': { top: '100%' }
        },
        'pulse-scale': {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' }
        },
        'progress-grow': {
          '0%': { width: '0%' },
          '100%': { width: '75%' }
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' }
        },
        'typewriter': {
          from: { width: '0' },
          to: { width: '100%' }
        },
        'blink': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' }
        }
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-in': 'fade-in 0.4s ease-out',
        'fade-in-up': 'fade-in-up 0.6s ease-out',
        'fade-in-down': 'fade-in-down 0.6s ease-out',
        'slide-in-left': 'slide-in-left 0.5s ease-out',
        'slide-in-right': 'slide-in-right 0.5s ease-out',
        'scale-in': 'scale-in 0.4s ease-out',
        'float': 'float 3s ease-in-out infinite',
        'pulse-subtle': 'pulse-subtle 2s ease-in-out infinite',
        'scroll-logos': 'scroll-logos 30s linear infinite',
        'fade-up': 'fade-up 0.6s ease forwards',
        'scan': 'scan 3s ease-in-out infinite',
        'pulse-scale': 'pulse-scale 2s ease-in-out infinite',
        'progress-grow': 'progress-grow 2s ease-out forwards delay-500',
        'shimmer': 'shimmer 2s linear infinite',
        'typewriter': 'typewriter 2s steps(40) forwards',
        'blink': 'blink 1s step-end infinite'
      },
      transitionDuration: {
        '400': '400ms',
      },
      transitionTimingFunction: {
        'spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      }
    }
  },
  plugins: [animate],
};

export default config;
