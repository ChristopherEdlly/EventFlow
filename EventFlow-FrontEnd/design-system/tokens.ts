/**
 * Design System Tokens
 * Event Management Platform
 *
 * Central source of truth for all design values.
 * These tokens are consumed by Tailwind config and can be imported directly in components.
 *
 * @module design-system/tokens
 */

/**
 * Color Palette
 * All colors follow a 50-900 scale for consistency
 */
export const colors = {
  // Primary brand color (Indigo) - Trust & Professionalism
  primary: {
    50: '#EEF2FF',
    100: '#E0E7FF',
    200: '#C7D2FE',
    300: '#A5B4FC',
    400: '#818CF8',
    500: '#6366F1', // Base
    600: '#4F46E5',
    700: '#4338CA',
    800: '#3730A3',
    900: '#312E81',
  },

  // Secondary accent color (Purple) - Creativity & Energy
  secondary: {
    50: '#FAF5FF',
    100: '#F3E8FF',
    200: '#E9D5FF',
    300: '#D8B4FE',
    400: '#C084FC',
    500: '#A855F7', // Base
    600: '#9333EA',
    700: '#7E22CE',
    800: '#6B21A8',
    900: '#581C87',
  },

  // Neutral grays (Warm Gray) - Text & Structure
  neutral: {
    50: '#FAFAF9',   // Page backgrounds
    100: '#F5F5F4',  // Card backgrounds
    200: '#E7E5E4',  // Borders
    300: '#D6D3D1',  // Disabled
    400: '#A8A29E',  // Placeholders
    500: '#78716C',  // Secondary text
    600: '#57534E',  // Body text
    700: '#44403C',  // Headings
    800: '#292524',  // Emphasized
    900: '#1C1917',  // Primary text
  },

  // Semantic colors
  success: {
    50: '#F0FDF4',
    100: '#DCFCE7',
    200: '#BBF7D0',
    300: '#86EFAC',
    400: '#4ADE80',
    500: '#22C55E',  // Base
    600: '#16A34A',
    700: '#15803D',
    800: '#166534',
    900: '#14532D',
  },

  error: {
    50: '#FEF2F2',
    100: '#FEE2E2',
    200: '#FECACA',
    300: '#FCA5A5',
    400: '#F87171',
    500: '#EF4444',  // Base
    600: '#DC2626',
    700: '#B91C1C',
    800: '#991B1B',
    900: '#7F1D1D',
  },

  warning: {
    50: '#FFFBEB',
    100: '#FEF3C7',
    200: '#FDE68A',
    300: '#FCD34D',
    400: '#FBBF24',
    500: '#F59E0B',  // Base
    600: '#D97706',
    700: '#B45309',
    800: '#92400E',
    900: '#78350F',
  },

  info: {
    50: '#EFF6FF',
    100: '#DBEAFE',
    200: '#BFDBFE',
    300: '#93C5FD',
    400: '#60A5FA',
    500: '#3B82F6',  // Base
    600: '#2563EB',
    700: '#1D4ED8',
    800: '#1E40AF',
    900: '#1E3A8A',
  },
} as const;

/**
 * Typography System
 */
export const typography = {
  // Font families
  fontFamily: {
    sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
    mono: ['JetBrains Mono', 'Fira Code', 'Courier New', 'monospace'],
  },

  // Font sizes (Modular scale with 1.25 ratio)
  fontSize: {
    xs: '0.75rem',      // 12px - Tiny labels, captions
    sm: '0.875rem',     // 14px - Small text, secondary info
    base: '1rem',       // 16px - Body text default
    lg: '1.125rem',     // 18px - Large body, subheadings
    xl: '1.25rem',      // 20px - h5, large labels
    '2xl': '1.5rem',    // 24px - h4, card titles
    '3xl': '1.875rem',  // 30px - h3, subsections
    '4xl': '2.25rem',   // 36px - h2, section headings
    '5xl': '3rem',      // 48px - h1, page titles
    '6xl': '3.75rem',   // 60px - Display, hero text
  },

  // Font weights
  fontWeight: {
    light: '300',      // Rarely used
    normal: '400',     // Body text
    medium: '500',     // Navigation, slight emphasis
    semibold: '600',   // Headings h3-h6, labels
    bold: '700',       // Major headings h1-h2
    extrabold: '800',  // Display text
  },

  // Line heights
  lineHeight: {
    none: '1',
    tight: '1.25',     // Headings
    snug: '1.375',
    normal: '1.5',     // Body text
    relaxed: '1.625',  // Long-form content
    loose: '2',
  },

  // Letter spacing
  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
  },
} as const;

/**
 * Spacing System
 * 4px base grid for perfect alignment
 */
export const spacing = {
  0: '0',
  1: '0.25rem',   // 4px
  2: '0.5rem',    // 8px - Tight
  3: '0.75rem',   // 12px
  4: '1rem',      // 16px - Standard (most common)
  5: '1.25rem',   // 20px
  6: '1.5rem',    // 24px - Relaxed
  8: '2rem',      // 32px - Loose
  10: '2.5rem',   // 40px
  12: '3rem',     // 48px - Section
  16: '4rem',     // 64px
  20: '5rem',     // 80px
  24: '6rem',     // 96px
  32: '8rem',     // 128px
} as const;

/**
 * Shadow System
 * Elevation levels for visual hierarchy
 */
export const shadows = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',                                           // Cards at rest
  DEFAULT: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',   // Standard elevation
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',     // Dropdowns
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',   // Modals
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',  // Important dialogs
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',                                  // Critical modals
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)',                                  // Input fields
  none: '0 0 #0000',
  focus: '0 0 0 3px rgba(99, 102, 241, 0.1)',                                      // Focus rings
  focusError: '0 0 0 3px rgba(239, 68, 68, 0.1)',                                  // Error focus rings
} as const;

/**
 * Border Radius
 * Consistent rounding for elements
 */
export const borderRadius = {
  none: '0',
  sm: '0.25rem',      // 4px
  DEFAULT: '0.375rem', // 6px - Default for most elements
  md: '0.5rem',       // 8px - Buttons
  lg: '0.75rem',      // 12px - Cards
  xl: '1rem',         // 16px - Modals
  '2xl': '1.5rem',    // 24px
  '3xl': '2rem',      // 32px
  full: '9999px',     // Pills, avatars
} as const;

/**
 * Animation
 * Timing and easing functions
 */
export const animation = {
  // Durations
  duration: {
    fast: '150ms',
    DEFAULT: '200ms',
    slow: '300ms',
    slower: '500ms',
    slowest: '700ms',
  },

  // Timing functions
  timingFunction: {
    linear: 'linear',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    spring: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },
} as const;

/**
 * Responsive Breakpoints
 * Mobile-first design approach
 */
export const breakpoints = {
  sm: '640px',   // Tablet portrait
  md: '768px',   // Tablet landscape
  lg: '1024px',  // Laptop
  xl: '1280px',  // Desktop
  '2xl': '1536px', // Large desktop
} as const;

/**
 * Z-Index Scale
 * Consistent stacking order
 */
export const zIndex = {
  base: 0,
  dropdown: 1000,
  sticky: 1100,
  fixed: 1200,
  overlay: 1300,
  modal: 1400,
  popover: 1500,
  toast: 1600,
} as const;

/**
 * Component-specific tokens
 */
export const components = {
  // Button dimensions
  button: {
    minHeight: '44px',  // Accessibility requirement
    minWidth: '44px',
    paddingX: {
      sm: spacing[3],   // 12px
      md: spacing[4],   // 16px
      lg: spacing[6],   // 24px
    },
    paddingY: {
      sm: spacing[2],   // 8px
      md: '0.625rem',   // 10px
      lg: spacing[3],   // 12px
    },
  },

  // Input dimensions
  input: {
    minHeight: '44px',  // Accessibility requirement
    padding: spacing[4], // 16px
    borderWidth: '1px',
  },

  // Card dimensions
  card: {
    padding: spacing[6], // 24px
    borderWidth: '1px',
    borderRadius: borderRadius.lg,
  },

  // Badge dimensions
  badge: {
    paddingX: '0.625rem', // 10px
    paddingY: '0.125rem', // 2px
    fontSize: typography.fontSize.xs,
    borderRadius: borderRadius.full,
  },
} as const;

/**
 * Accessibility Constants
 * WCAG 2.1 AA compliance values
 */
export const accessibility = {
  // Minimum contrast ratios
  contrastRatios: {
    normalText: 4.5,      // WCAG AA for normal text
    largeText: 3,         // WCAG AA for large text (18px+ or 14px+ bold)
    uiComponents: 3,      // WCAG AA for UI components
  },

  // Touch targets
  touchTarget: {
    minSize: '44px',      // Minimum 44x44px for mobile
    minSpacing: spacing[2], // 8px minimum spacing between targets
  },

  // Focus indicators
  focusRing: {
    width: '3px',
    offset: '2px',
    color: colors.primary[100],
  },

  // Animation preferences
  motion: {
    reducedMotionDuration: '0.01ms', // Fallback for reduced motion preference
  },
} as const;

/**
 * Type exports for TypeScript
 */
export type Color = typeof colors;
export type Typography = typeof typography;
export type Spacing = typeof spacing;
export type Shadow = typeof shadows;
export type BorderRadius = typeof borderRadius;
export type Animation = typeof animation;
export type Breakpoint = typeof breakpoints;
export type ZIndex = typeof zIndex;
export type Components = typeof components;
export type Accessibility = typeof accessibility;

/**
 * Default export - all tokens
 */
export default {
  colors,
  typography,
  spacing,
  shadows,
  borderRadius,
  animation,
  breakpoints,
  zIndex,
  components,
  accessibility,
} as const;
