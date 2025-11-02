/**
 * Button Component Types
 * Interactive button component with multiple variants and states
 */

import React from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * Visual style variant
   * @default 'primary'
   */
  variant?: ButtonVariant;

  /**
   * Size of the button
   * @default 'md'
   */
  size?: ButtonSize;

  /**
   * Whether button is disabled
   * @default false
   */
  disabled?: boolean;

  /**
   * Show loading spinner and disable interactions
   * @default false
   */
  loading?: boolean;

  /**
   * Make button full width
   * @default false
   */
  fullWidth?: boolean;

  /**
   * Icon to display before text
   */
  leftIcon?: React.ReactNode;

  /**
   * Icon to display after text
   */
  rightIcon?: React.ReactNode;

  /**
   * Button content
   */
  children: React.ReactNode;

  /**
   * Additional CSS classes
   */
  className?: string;

  /**
   * Click handler
   */
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
}
