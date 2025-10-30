/**
 * Grid Component Types
 * Responsive grid layout component
 */

import React from 'react';

export type GridGap = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface GridCols {
  /**
   * Columns at default (mobile)
   */
  default?: number;
  /**
   * Columns at sm breakpoint (640px+)
   */
  sm?: number;
  /**
   * Columns at md breakpoint (768px+)
   */
  md?: number;
  /**
   * Columns at lg breakpoint (1024px+)
   */
  lg?: number;
  /**
   * Columns at xl breakpoint (1280px+)
   */
  xl?: number;
  /**
   * Columns at 2xl breakpoint (1536px+)
   */
  '2xl'?: number;
}

export interface GridProps {
  /**
   * Number of columns (1-12) or responsive object
   * @default { default: 1, md: 2, lg: 3 }
   */
  cols?: number | GridCols;

  /**
   * Gap between grid items
   * @default 'md'
   */
  gap?: GridGap;

  /**
   * Grid content
   */
  children: React.ReactNode;

  /**
   * Additional CSS classes
   */
  className?: string;
}
