/**
 * Input Component
 * Accessible form input with labels, errors, and icons
 */

import React, { useId } from 'react';
import clsx from 'clsx';
import { InputProps, TextareaProps } from './Input.types';

/**
 * Input component for form fields
 *
 * @example
 * ```tsx
 * <Input
 *   label="Email"
 *   type="email"
 *   placeholder="Enter your email"
 *   required
 * />
 * ```
 */
export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      type = 'text',
      label,
      helperText,
      error,
      required = false,
      disabled = false,
      leftIcon,
      rightIcon,
      className,
      inputClassName,
      id: providedId,
      ...rest
    },
    ref
  ) => {
    const generatedId = useId();
    const id = providedId || generatedId;
    const helperId = `${id}-helper`;
    const errorId = `${id}-error`;

    const hasError = Boolean(error);

    // Base input styles
    const baseStyles = clsx(
      'w-full min-h-[44px]',
      'px-4 py-2.5',
      'text-base text-neutral-900 placeholder-neutral-400',
      'bg-white border rounded-lg',
      'transition-all duration-200',
      'focus:outline-none focus:ring-2 focus:ring-offset-0',
      'disabled:bg-neutral-100 disabled:text-neutral-500 disabled:cursor-not-allowed'
    );

    // State-based styles
    const stateStyles = hasError
      ? 'border-error-500 focus:border-error-500 focus:ring-error-100'
      : 'border-neutral-300 focus:border-primary-500 focus:ring-primary-100';

    // Icon padding
    const iconPaddingStyles = clsx(
      leftIcon && 'pl-11',
      rightIcon && 'pr-11'
    );

    return (
      <div className={className}>
        {/* Label */}
        {label && (
          <label
            htmlFor={id}
            className="block text-sm font-medium text-neutral-700 mb-1.5"
          >
            {label}
            {required && <span className="text-error-500 ml-1" aria-label="required">*</span>}
          </label>
        )}

        {/* Input Container */}
        <div className="relative">
          {/* Left Icon */}
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none">
              {leftIcon}
            </div>
          )}

          {/* Input */}
          <input
            ref={ref}
            id={id}
            type={type}
            disabled={disabled}
            required={required}
            aria-invalid={hasError}
            aria-describedby={clsx(
              error && errorId,
              helperText && !error && helperId
            )}
            className={clsx(
              baseStyles,
              stateStyles,
              iconPaddingStyles,
              inputClassName
            )}
            {...rest}
          />

          {/* Right Icon */}
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none">
              {rightIcon}
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <p id={errorId} className="mt-1.5 text-sm text-error-600" role="alert">
            {error}
          </p>
        )}

        {/* Helper Text */}
        {helperText && !error && (
          <p id={helperId} className="mt-1.5 text-sm text-neutral-600">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

/**
 * Textarea component for multi-line text input
 *
 * @example
 * ```tsx
 * <Textarea
 *   label="Description"
 *   placeholder="Enter event description"
 *   rows={5}
 * />
 * ```
 */
export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      helperText,
      error,
      required = false,
      disabled = false,
      rows = 4,
      resize = 'vertical',
      className,
      textareaClassName,
      id: providedId,
      ...rest
    },
    ref
  ) => {
    const generatedId = useId();
    const id = providedId || generatedId;
    const helperId = `${id}-helper`;
    const errorId = `${id}-error`;

    const hasError = Boolean(error);

    // Base textarea styles
    const baseStyles = clsx(
      'w-full',
      'px-4 py-2.5',
      'text-base text-neutral-900 placeholder-neutral-400',
      'bg-white border rounded-lg',
      'transition-all duration-200',
      'focus:outline-none focus:ring-2 focus:ring-offset-0',
      'disabled:bg-neutral-100 disabled:text-neutral-500 disabled:cursor-not-allowed'
    );

    // State-based styles
    const stateStyles = hasError
      ? 'border-error-500 focus:border-error-500 focus:ring-error-100'
      : 'border-neutral-300 focus:border-primary-500 focus:ring-primary-100';

    // Resize styles
    const resizeStyles = {
      none: 'resize-none',
      vertical: 'resize-y',
      horizontal: 'resize-x',
      both: 'resize',
    };

    return (
      <div className={className}>
        {/* Label */}
        {label && (
          <label
            htmlFor={id}
            className="block text-sm font-medium text-neutral-700 mb-1.5"
          >
            {label}
            {required && <span className="text-error-500 ml-1" aria-label="required">*</span>}
          </label>
        )}

        {/* Textarea */}
        <textarea
          ref={ref}
          id={id}
          rows={rows}
          disabled={disabled}
          required={required}
          aria-invalid={hasError}
          aria-describedby={clsx(
            error && errorId,
            helperText && !error && helperId
          )}
          className={clsx(
            baseStyles,
            stateStyles,
            resizeStyles[resize],
            textareaClassName
          )}
          {...rest}
        />

        {/* Error Message */}
        {error && (
          <p id={errorId} className="mt-1.5 text-sm text-error-600" role="alert">
            {error}
          </p>
        )}

        {/* Helper Text */}
        {helperText && !error && (
          <p id={helperId} className="mt-1.5 text-sm text-neutral-600">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

export default Input;
