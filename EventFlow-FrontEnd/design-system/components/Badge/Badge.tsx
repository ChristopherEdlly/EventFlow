/**
 * Badge Component
 * Status and category indicators with multiple variants
 */

import React from 'react';
import clsx from 'clsx';
import { BadgeProps } from './Badge.types';

/**
 * Badge component for status and category indicators
 *
 * @example
 * ```tsx
 * <Badge variant="success">Active</Badge>
 * ```
 */
export const Badge: React.FC<BadgeProps> = ({
  variant = 'neutral',
  size = 'md',
  dot = false,
  pill = true,
  children,
  className,
}) => {
  // Base styles
  const baseStyles = clsx(
    'inline-flex items-center justify-center',
    'font-medium',
    'transition-colors duration-200'
  );

  // Variant styles
  const variantStyles = {
    primary: 'bg-primary-100 text-primary-800 border border-primary-200',
    secondary: 'bg-secondary-100 text-secondary-800 border border-secondary-200',
    success: 'bg-success-100 text-success-800 border border-success-200',
    warning: 'bg-warning-100 text-warning-800 border border-warning-200',
    danger: 'bg-error-100 text-error-800 border border-error-200',
    info: 'bg-info-100 text-info-800 border border-info-200',
    neutral: 'bg-neutral-100 text-neutral-800 border border-neutral-200',
  };

  // Size styles
  const sizeStyles = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base',
  };

  // Dot size styles
  const dotSizeStyles = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
    lg: 'w-2.5 h-2.5',
  };

  // Border radius
  const radiusStyles = pill ? 'rounded-full' : 'rounded-md';

  // Dot color matching variant
  const dotColorStyles = {
    primary: 'bg-primary-600',
    secondary: 'bg-secondary-600',
    success: 'bg-success-600',
    warning: 'bg-warning-600',
    danger: 'bg-error-600',
    info: 'bg-info-600',
    neutral: 'bg-neutral-600',
  };

  return (
    <span
      className={clsx(
        baseStyles,
        variantStyles[variant],
        sizeStyles[size],
        radiusStyles,
        dot && 'gap-1.5',
        className
      )}
    >
      {dot && (
        <span
          className={clsx(
            'rounded-full flex-shrink-0',
            dotSizeStyles[size],
            dotColorStyles[variant]
          )}
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  );
};

Badge.displayName = 'Badge';

export default Badge;
