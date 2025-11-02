/**
 * Spinner Component Types
 * Loading indicator for async operations
 */

export type SpinnerSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type SpinnerColor = 'primary' | 'secondary' | 'white';

export interface SpinnerProps {
  /**
   * Size of the spinner
   * @default 'md'
   */
  size?: SpinnerSize;

  /**
   * Color variant of the spinner
   * @default 'primary'
   */
  color?: SpinnerColor;

  /**
   * Additional CSS classes
   */
  className?: string;

  /**
   * Accessible label for screen readers
   * @default 'Loading'
   */
  label?: string;
}
