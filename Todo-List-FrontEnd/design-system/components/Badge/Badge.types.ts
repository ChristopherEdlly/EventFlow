/**
 * Badge Component Types
 * Status and category indicators
 */

import React from 'react';

export type BadgeVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';
export type BadgeSize = 'sm' | 'md' | 'lg';

export interface BadgeProps {
  /**
   * Visual style variant
   * @default 'neutral'
   */
  variant?: BadgeVariant;

  /**
   * Size of the badge
   * @default 'md'
   */
  size?: BadgeSize;

  /**
   * Show dot indicator
   * @default false
   */
  dot?: boolean;

  /**
   * Use pill shape (fully rounded)
   * @default true
   */
  pill?: boolean;

  /**
   * Badge content
   */
  children: React.ReactNode;

  /**
   * Additional CSS classes
   */
  className?: string;
}
