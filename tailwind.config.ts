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
        // Conversion.ai Design System Palette
        conversion: {
          white: '#FFFFFF',
          beige: '#FDFCFB',
          black: '#000000',
          charcoal: '#21201C',
          'card-hover': '#272724',
          green: '#24A871',
          purple: '#9F65AD',
          red: '#9F2C2C',
          blue: '#2C789F',
          'dark-blue': '#225E7D',
          border: {
            light: '#E0E0E0',
            dark: '#3C3B37'
          }
        },
  			brand: {
  				DEFAULT: '#6E49FF',
  				dark: '#4D2ED6',
  				light: '#A794FF'
  			},
  			electric: {
  				'50': '#f0f6ff',
  				'100': '#dbe8ff',
  				'200': '#b3ceff',
  				'300': '#7eacff',
  				'400': '#4c8bff',
  				'500': '#2a6fe6',
  				'600': '#1a55b4',
  				'700': '#123c82',
  				'800': '#0b2759',
  				'900': '#051530'
  			},
  			surface: '#0F1117',
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
  			mono: [
  				'var(--font-geist-mono)',
  				'SFMono-Regular',
  				'monospace'
  			],
        serif: [
          'Times New Roman',
          'serif'
        ]
  		},
  		boxShadow: {
  			'soft-card': '0 15px 35px rgba(24, 34, 63, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.04)'
  		},
  		keyframes: {
  			'accordion-down': {
  				from: {
  					height: '0'
  				},
  				to: {
  					height: 'var(--radix-accordion-content-height)'
  				}
  			},
  			'accordion-up': {
  				from: {
  					height: 'var(--radix-accordion-content-height)'
  				},
  				to: {
  					height: '0'
  				}
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
        }
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out',
        'scroll-logos': 'scroll-logos 30s linear infinite',
        'fade-up': 'fade-up 0.6s ease forwards',
        'scan': 'scan 3s ease-in-out infinite',
        'pulse-scale': 'pulse-scale 2s ease-in-out infinite',
        'progress-grow': 'progress-grow 2s ease-out forwards delay-500'
  		}
  	}
  },
  plugins: [animate],
};

export default config;
