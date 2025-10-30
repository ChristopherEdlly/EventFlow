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
