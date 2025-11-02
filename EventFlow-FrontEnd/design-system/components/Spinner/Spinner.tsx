/**
 * Spinner Component
 * Accessible loading indicator with multiple sizes and colors
 */

import React from 'react';
import clsx from 'clsx';
import { SpinnerProps } from './Spinner.types';

/**
 * Spinner component for indicating loading states
 *
 * @example
 * ```tsx
 * <Spinner size="md" color="primary" />
 * ```
 */
export const Spinner: React.FC<SpinnerProps> = ({
  size = 'md',
  color = 'primary',
  className,
  label = 'Loading',
}) => {
  const sizeClasses = {
    xs: 'w-3 h-3 border-2',
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-2',
    lg: 'w-8 h-8 border-3',
    xl: 'w-12 h-12 border-4',
  };

  const colorClasses = {
    primary: 'border-primary-200 border-t-primary-600',
    secondary: 'border-secondary-200 border-t-secondary-600',
    white: 'border-white/20 border-t-white',
  };

  return (
    <div
      className={clsx(
        'inline-block rounded-full animate-spin',
        sizeClasses[size],
        colorClasses[color],
        className
      )}
      role="status"
      aria-label={label}
      aria-live="polite"
    >
      <span className="sr-only">{label}</span>
    </div>
  );
};

Spinner.displayName = 'Spinner';

export default Spinner;
