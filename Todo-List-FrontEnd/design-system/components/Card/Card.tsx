/**
 * Card Component
 * Container for grouping related content with optional header and footer
 */

import React from 'react';
import clsx from 'clsx';
import { CardProps } from './Card.types';

/**
 * Card component for content containers
 *
 * @example
 * ```tsx
 * <Card header={<h3>Event Details</h3>}>
 *   <p>Event content here</p>
 * </Card>
 * ```
 */
export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      variant = 'default',
      header,
      footer,
      children,
      className,
      onClick,
      padding,
      noPadding = false,
      ...rest
    },
    ref
  ) => {
    const isInteractive = variant === 'interactive' || onClick !== undefined;

    // Base styles
    const baseStyles = clsx(
      'bg-white rounded-lg',
      'transition-all duration-200'
    );

    // Variant styles
    const variantStyles = {
      default: clsx(
        'border border-neutral-200',
        'shadow-sm'
      ),
      hover: clsx(
        'border border-neutral-200',
        'shadow-sm hover:shadow-md'
      ),
      interactive: clsx(
        'border border-neutral-200',
        'shadow-sm hover:shadow-md hover:border-primary-300',
        'cursor-pointer',
        'active:scale-[0.98]'
      ),
      outlined: clsx(
        'border-2 border-neutral-300'
      ),
    };

    // Padding styles
    const paddingStyles = noPadding
      ? ''
      : padding || 'p-6';

    // Click handler styles
    const interactiveStyles = isInteractive && !variantStyles.interactive
      ? 'cursor-pointer hover:shadow-md active:scale-[0.98]'
      : '';

    // Keyboard interaction for interactive cards
    const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (isInteractive && onClick && (event.key === 'Enter' || event.key === ' ')) {
        event.preventDefault();
        onClick(event as unknown as React.MouseEvent<HTMLDivElement>);
      }
    };

    return (
      <div
        ref={ref}
        className={clsx(
          baseStyles,
          variantStyles[variant],
          interactiveStyles,
          className
        )}
        onClick={onClick}
        onKeyDown={isInteractive ? handleKeyDown : undefined}
        role={isInteractive ? 'button' : undefined}
        tabIndex={isInteractive ? 0 : undefined}
        {...rest}
      >
        {header && (
          <div className={clsx(
            'border-b border-neutral-200',
            noPadding ? 'px-6 py-4' : paddingStyles.includes('p-') ? 'px-6 py-4' : padding
          )}>
            {header}
          </div>
        )}

        <div className={paddingStyles}>
          {children}
        </div>

        {footer && (
          <div className={clsx(
            'border-t border-neutral-200',
            noPadding ? 'px-6 py-4' : paddingStyles.includes('p-') ? 'px-6 py-4' : padding
          )}>
            {footer}
          </div>
        )}
      </div>
    );
  }
);

Card.displayName = 'Card';

export default Card;
