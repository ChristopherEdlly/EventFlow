/**
 * Type declarations for design system integration
 */

import type { DesignTokens } from '../design-system/tokens';

declare module '@design-system/tokens' {
  export * from '../design-system/tokens';
}

// Augment tailwind config types
declare module 'tailwindcss/tailwind-config' {
  interface TailwindTheme {
    extend?: {
      colors?: Record<string, string | Record<string, string>>;
      fontFamily?: Record<string, string[]>;
      fontSize?: Record<string, [string, { lineHeight: string; letterSpacing?: string }]>;
      spacing?: Record<string, string>;
      borderRadius?: Record<string, string>;
      boxShadow?: Record<string, string>;
    };
  }
}

export type { DesignTokens };
