/**
 * Stack Component Types
 * Flexbox layout with consistent spacing
 */

import React from 'react';

export type StackDirection = 'vertical' | 'horizontal';
export type StackSpacing = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type StackAlign = 'start' | 'center' | 'end' | 'stretch';
export type StackJustify = 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';

export interface StackProps {
  /**
   * Stack direction
   * @default 'vertical'
   */
  direction?: StackDirection;

  /**
   * Gap between children (uses spacing tokens)
   * @default 'md'
   */
  spacing?: StackSpacing;

  /**
   * Cross-axis alignment
   * @default 'stretch'
   */
  align?: StackAlign;

  /**
   * Main-axis alignment
   * @default 'start'
   */
  justify?: StackJustify;

  /**
   * Allow wrapping
   * @default false
   */
  wrap?: boolean;

  /**
   * Stack content
   */
  children: React.ReactNode;

  /**
   * Additional CSS classes
   */
  className?: string;
}
