/**
 * Grid Component
 * Responsive grid layout with configurable columns and gaps
 */

import React from 'react';
import clsx from 'clsx';
import { GridProps, GridCols } from './Grid.types';

/**
 * Grid component for responsive layouts
 *
 * @example
 * ```tsx
 * <Grid cols={{ default: 1, md: 2, lg: 3 }} gap="md">
 *   <Card>Item 1</Card>
 *   <Card>Item 2</Card>
 *   <Card>Item 3</Card>
 * </Grid>
 * ```
 */
export const Grid: React.FC<GridProps> = ({
  cols = { default: 1, md: 2, lg: 3 },
  gap = 'md',
  children,
  className,
}) => {
  // Gap styles
  const gapStyles = {
    xs: 'gap-2',   // 8px
    sm: 'gap-3',   // 12px
    md: 'gap-4',   // 16px
    lg: 'gap-6',   // 24px
    xl: 'gap-8',   // 32px
  };

  // Column mapping for Tailwind classes
  const colsMap: Record<number, string> = {
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
    5: 'grid-cols-5',
    6: 'grid-cols-6',
    7: 'grid-cols-7',
    8: 'grid-cols-8',
    9: 'grid-cols-9',
    10: 'grid-cols-10',
    11: 'grid-cols-11',
    12: 'grid-cols-12',
  };

  // Build column classes
  const getColumnClasses = (): string => {
    if (typeof cols === 'number') {
      return colsMap[cols] || 'grid-cols-1';
    }

    const gridCols = cols as GridCols;
    const classes: string[] = [];

    // Default columns
    if (gridCols.default) {
      const colClass = colsMap[gridCols.default];
      if (colClass) {
        classes.push(colClass);
      }
    }

    // Responsive columns
    if (gridCols.sm) {
      classes.push(`sm:grid-cols-${gridCols.sm}`);
    }
    if (gridCols.md) {
      classes.push(`md:grid-cols-${gridCols.md}`);
    }
    if (gridCols.lg) {
      classes.push(`lg:grid-cols-${gridCols.lg}`);
    }
    if (gridCols.xl) {
      classes.push(`xl:grid-cols-${gridCols.xl}`);
    }
    if (gridCols['2xl']) {
      classes.push(`2xl:grid-cols-${gridCols['2xl']}`);
    }

    return classes.join(' ');
  };

  return (
    <div
      className={clsx(
        'grid',
        getColumnClasses(),
        gapStyles[gap],
        className
      )}
    >
      {children}
    </div>
  );
};

Grid.displayName = 'Grid';

export default Grid;
