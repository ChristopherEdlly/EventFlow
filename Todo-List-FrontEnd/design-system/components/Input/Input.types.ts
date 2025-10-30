/**
 * Input Component Types
 * Form input fields with validation support
 */

import React from 'react';

export type InputType = 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search' | 'date' | 'time' | 'datetime-local';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /**
   * Input type
   * @default 'text'
   */
  type?: InputType;

  /**
   * Input label
   */
  label?: string;

  /**
   * Helper text displayed below input
   */
  helperText?: string;

  /**
   * Error message (also sets error state)
   */
  error?: string;

  /**
   * Whether the field is required
   * @default false
   */
  required?: boolean;

  /**
   * Whether the input is disabled
   * @default false
   */
  disabled?: boolean;

  /**
   * Icon to display before input
   */
  leftIcon?: React.ReactNode;

  /**
   * Icon to display after input
   */
  rightIcon?: React.ReactNode;

  /**
   * Additional CSS classes for input wrapper
   */
  className?: string;

  /**
   * Additional CSS classes for input element
   */
  inputClassName?: string;
}

export interface TextareaProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'rows'> {
  /**
   * Input label
   */
  label?: string;

  /**
   * Helper text displayed below textarea
   */
  helperText?: string;

  /**
   * Error message (also sets error state)
   */
  error?: string;

  /**
   * Whether the field is required
   * @default false
   */
  required?: boolean;

  /**
   * Whether the textarea is disabled
   * @default false
   */
  disabled?: boolean;

  /**
   * Number of visible text rows
   * @default 4
   */
  rows?: number;

  /**
   * Allow resizing
   * @default 'vertical'
   */
  resize?: 'none' | 'vertical' | 'horizontal' | 'both';

  /**
   * Additional CSS classes for textarea wrapper
   */
  className?: string;

  /**
   * Additional CSS classes for textarea element
   */
  textareaClassName?: string;
}
