/**
 * Container Component
 * Max-width wrapper with responsive padding for content layout
 */

import React from 'react';
import clsx from 'clsx';
import { ContainerProps } from './Container.types';

/**
 * Container component for layout structure
 *
 * @example
 * ```tsx
 * <Container size="lg">
 *   <h1>Page Content</h1>
 * </Container>
 * ```
 */
export const Container: React.FC<ContainerProps> = ({
  size = 'xl',
  children,
  className,
  center = true,
}) => {
  // Size-based max-width
  const sizeStyles = {
    sm: 'max-w-screen-sm',   // 640px
    md: 'max-w-screen-md',   // 768px
    lg: 'max-w-screen-lg',   // 1024px
    xl: 'max-w-screen-xl',   // 1280px
    full: 'max-w-full',
  };

  // Responsive padding
  const paddingStyles = 'px-4 sm:px-6 lg:px-8';

  // Centering
  const centerStyles = center ? 'mx-auto' : '';

  return (
    <div
      className={clsx(
        'w-full',
        sizeStyles[size],
        paddingStyles,
        centerStyles,
        className
      )}
    >
      {children}
    </div>
  );
};

Container.displayName = 'Container';

export default Container;
