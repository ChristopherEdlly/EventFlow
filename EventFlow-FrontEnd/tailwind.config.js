import { colors, typography, spacing, shadows, borderRadius, animation, breakpoints, zIndex } from './design-system/tokens';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./**/*.{js,ts,jsx,tsx}",
    "!./node_modules/**/*",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        ...colors,
      },
      fontFamily: {
        ...typography.fontFamily,
      },
      fontSize: {
        ...typography.fontSize,
      },
      fontWeight: {
        ...typography.fontWeight,
      },
      lineHeight: {
        ...typography.lineHeight,
      },
      letterSpacing: {
        ...typography.letterSpacing,
      },
      spacing: {
        ...spacing,
      },
      borderRadius: {
        ...borderRadius,
      },
      boxShadow: {
        ...shadows,
      },
      transitionDuration: {
        ...animation.duration,
      },
      transitionTimingFunction: {
        ...animation.timingFunction,
      },
      screens: {
        ...breakpoints,
      },
      zIndex: {
        ...zIndex,
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}
