/**
 * Card Component Types
 * Container component for grouping related content
 */

import React from 'react';

export type CardVariant = 'default' | 'hover' | 'interactive' | 'outlined';

export interface CardProps {
  /**
   * Visual style variant
   * @default 'default'
   */
  variant?: CardVariant;

  /**
   * Card header content
   */
  header?: React.ReactNode;

  /**
   * Card footer content
   */
  footer?: React.ReactNode;

  /**
   * Main card content
   */
  children: React.ReactNode;

  /**
   * Additional CSS classes
   */
  className?: string;

  /**
   * Click handler (makes card interactive)
   */
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;

  /**
   * Custom padding (overrides default)
   */
  padding?: string;

  /**
   * Remove default padding
   * @default false
   */
  noPadding?: boolean;
}
