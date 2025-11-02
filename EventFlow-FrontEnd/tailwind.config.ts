/**
 * Tailwind CSS Configuration
 * Event Management Platform Design System Integration
 *
 * This configuration extends Tailwind CSS with our custom design tokens
 * from the design system, ensuring consistent styling across the application.
 */

import type { Config } from 'tailwindcss';
import tokens from './design-system/tokens';

const config: Config = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './events/**/*.{js,ts,jsx,tsx}',
  ],

  theme: {
    extend: {
      /**
       * Color Palette
       * Imported from design system tokens
       */
      colors: tokens.colors,

      /**
       * Typography
       * Imported from design system tokens
       */
      fontFamily: tokens.typography.fontFamily,
      fontSize: tokens.typography.fontSize,
      fontWeight: tokens.typography.fontWeight,
      lineHeight: tokens.typography.lineHeight,
      letterSpacing: tokens.typography.letterSpacing,

      /**
       * Spacing
       * Imported from design system tokens (4px base grid)
       */
      spacing: tokens.spacing,

      /**
       * Shadows
       * Imported from design system tokens
       */
      boxShadow: tokens.shadows,

      /**
       * Border Radius
       * Imported from design system tokens
       */
      borderRadius: tokens.borderRadius,

      /**
       * Animation
       * Imported from design system tokens
       */
      transitionDuration: tokens.animation.duration,
      transitionTimingFunction: tokens.animation.timingFunction,

      /**
       * Z-Index
       * Imported from design system tokens
       */
      zIndex: tokens.zIndex,

      /**
       * Breakpoints
       * Imported from design system tokens (mobile-first)
       */
      screens: tokens.breakpoints,

      /**
       * Minimum sizes for accessibility
       * From design system tokens
       */
      minHeight: {
        touch: tokens.accessibility.touchTarget.minSize,
      },
      minWidth: {
        touch: tokens.accessibility.touchTarget.minSize,
      },

      /**
       * Custom Animations
       */
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'fade-out': {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        'slide-in-right': {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        'slide-out-right': {
          '0%': { transform: 'translateX(0)', opacity: '1' },
          '100%': { transform: 'translateX(100%)', opacity: '0' },
        },
        'slide-in-up': {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'slide-in-down': {
          '0%': { transform: 'translateY(-100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'scale-in': {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'scale-out': {
          '0%': { transform: 'scale(1)', opacity: '1' },
          '100%': { transform: 'scale(0.95)', opacity: '0' },
        },
        'shimmer': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        'bounce-slow': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.2s ease-out',
        'fade-out': 'fade-out 0.2s ease-in',
        'slide-in-right': 'slide-in-right 0.3s ease-out',
        'slide-out-right': 'slide-out-right 0.3s ease-in',
        'slide-in-up': 'slide-in-up 0.3s ease-out',
        'slide-in-down': 'slide-in-down 0.3s ease-out',
        'scale-in': 'scale-in 0.2s ease-out',
        'scale-out': 'scale-out 0.2s ease-in',
        'shimmer': 'shimmer 2s infinite',
        'bounce-slow': 'bounce-slow 3s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
      },
    },
  },

  plugins: [
    /**
     * Custom plugin for accessibility utilities
     */
    function({ addUtilities }: any) {
      const newUtilities = {
        '.focus-ring': {
          '@apply focus:outline-none focus:ring-3 focus:ring-primary-100 focus:border-primary-500': {},
        },
        '.focus-ring-error': {
          '@apply focus:outline-none focus:ring-3 focus:ring-error-100 focus:border-error-500': {},
        },
        '.touch-target': {
          '@apply min-h-touch min-w-touch': {},
        },
      };

      addUtilities(newUtilities);
    },
  ],
};

export default config;
