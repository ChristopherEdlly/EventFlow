/**
 * Button Component
 * Accessible, customizable button with multiple variants and states
 */

import React from 'react';
import clsx from 'clsx';
import { ButtonProps } from './Button.types';
import { Spinner } from '../Spinner';

/**
 * Button component for user interactions
 *
 * @example
 * ```tsx
 * <Button variant="primary" onClick={handleClick}>
 *   Click me
 * </Button>
 * ```
 */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      disabled = false,
      loading = false,
      fullWidth = false,
      leftIcon,
      rightIcon,
      children,
      className,
      onClick,
      type = 'button',
      ...rest
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    // Base styles for all buttons
    const baseStyles = clsx(
      'inline-flex items-center justify-center',
      'font-medium rounded-lg',
      'transition-all duration-200',
      'focus:outline-none focus:ring-2 focus:ring-offset-2',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      'active:scale-95'
    );

    // Variant styles
    const variantStyles = {
      primary: clsx(
        'bg-primary-600 text-white',
        'hover:bg-primary-700',
        'focus:ring-primary-500',
        'shadow-sm hover:shadow-md',
        'disabled:hover:bg-primary-600 disabled:hover:shadow-sm'
      ),
      secondary: clsx(
        'bg-secondary-600 text-white',
        'hover:bg-secondary-700',
        'focus:ring-secondary-500',
        'shadow-sm hover:shadow-md',
        'disabled:hover:bg-secondary-600 disabled:hover:shadow-sm'
      ),
      outline: clsx(
        'bg-transparent border-2 border-neutral-300 text-neutral-700',
        'hover:bg-neutral-50 hover:border-neutral-400',
        'focus:ring-primary-500',
        'disabled:hover:bg-transparent disabled:hover:border-neutral-300'
      ),
      ghost: clsx(
        'bg-transparent text-neutral-700',
        'hover:bg-neutral-100',
        'focus:ring-primary-500',
        'disabled:hover:bg-transparent'
      ),
      danger: clsx(
        'bg-error-600 text-white',
        'hover:bg-error-700',
        'focus:ring-error-500',
        'shadow-sm hover:shadow-md',
        'disabled:hover:bg-error-600 disabled:hover:shadow-sm'
      ),
    };

    // Size styles
    const sizeStyles = {
      sm: 'px-3 py-1.5 text-sm min-h-[36px]',
      md: 'px-4 py-2.5 text-base min-h-[44px]',
      lg: 'px-6 py-3 text-lg min-h-[52px]',
    };

    // Width styles
    const widthStyles = fullWidth ? 'w-full' : '';

    // Icon spacing
    const iconSpacing = {
      sm: 'gap-1.5',
      md: 'gap-2',
      lg: 'gap-2.5',
    };

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      if (!isDisabled && onClick) {
        onClick(event);
      }
    };

    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        onClick={handleClick}
        className={clsx(
          baseStyles,
          variantStyles[variant],
          sizeStyles[size],
          widthStyles,
          iconSpacing[size],
          className
        )}
        aria-busy={loading}
        {...rest}
      >
        {loading && (
          <Spinner
            size={size === 'lg' ? 'sm' : 'xs'}
            color={variant === 'outline' || variant === 'ghost' ? 'primary' : 'white'}
          />
        )}
        {!loading && leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
        <span>{children}</span>
        {!loading && rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
