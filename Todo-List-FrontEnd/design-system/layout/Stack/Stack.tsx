/**
 * Stack Component
 * Flexible layout component for vertical or horizontal stacking with consistent spacing
 */

import React from 'react';
import clsx from 'clsx';
import { StackProps } from './Stack.types';

/**
 * Stack component for layout spacing
 *
 * @example
 * ```tsx
 * <Stack spacing="md">
 *   <div>Item 1</div>
 *   <div>Item 2</div>
 * </Stack>
 * ```
 */
export const Stack: React.FC<StackProps> = ({
  direction = 'vertical',
  spacing = 'md',
  align = 'stretch',
  justify = 'start',
  wrap = false,
  children,
  className,
}) => {
  // Direction styles
  const directionStyles = {
    vertical: 'flex-col',
    horizontal: 'flex-row',
  };

  // Spacing styles (using design system tokens via Tailwind)
  const spacingStyles = {
    xs: 'gap-2',   // 8px
    sm: 'gap-3',   // 12px
    md: 'gap-4',   // 16px
    lg: 'gap-6',   // 24px
    xl: 'gap-8',   // 32px
  };

  // Alignment styles (cross-axis)
  const alignStyles = {
    start: 'items-start',
    center: 'items-center',
    end: 'items-end',
    stretch: 'items-stretch',
  };

  // Justify styles (main-axis)
  const justifyStyles = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
    between: 'justify-between',
    around: 'justify-around',
    evenly: 'justify-evenly',
  };

  // Wrap style
  const wrapStyle = wrap ? 'flex-wrap' : 'flex-nowrap';

  return (
    <div
      className={clsx(
        'flex',
        directionStyles[direction],
        spacingStyles[spacing],
        alignStyles[align],
        justifyStyles[justify],
        wrapStyle,
        className
      )}
    >
      {children}
    </div>
  );
};

Stack.displayName = 'Stack';

export default Stack;
