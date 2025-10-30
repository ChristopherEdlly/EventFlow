/**
 * Container Component Types
 * Max-width wrapper with responsive padding
 */

import React from 'react';

export type ContainerSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

export interface ContainerProps {
  /**
   * Maximum width of container
   * @default 'xl'
   */
  size?: ContainerSize;

  /**
   * Container content
   */
  children: React.ReactNode;

  /**
   * Additional CSS classes
   */
  className?: string;

  /**
   * Center container horizontally
   * @default true
   */
  center?: boolean;
}
