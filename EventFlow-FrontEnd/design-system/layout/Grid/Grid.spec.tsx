import { describe, it, expect } from 'vitest';
import { render, screen } from '@/test/utils';
import { Grid } from './Grid';

describe('Grid', () => {
  describe('Rendering', () => {
    it('renders children', () => {
      render(
        <Grid>
          <div>Item 1</div>
          <div>Item 2</div>
        </Grid>
      );
      expect(screen.getByText('Item 1')).toBeInTheDocument();
      expect(screen.getByText('Item 2')).toBeInTheDocument();
    });

    it('renders as div element', () => {
      const { container } = render(<Grid>Content</Grid>);
      expect(container.firstChild?.nodeName).toBe('DIV');
    });

    it('uses CSS grid', () => {
      const { container } = render(<Grid>Content</Grid>);
      const element = container.firstChild as HTMLElement;
      expect(element).toHaveClass('grid');
    });

    it('has default gap (md)', () => {
      const { container } = render(<Grid>Content</Grid>);
      const element = container.firstChild as HTMLElement;
      expect(element).toHaveClass('gap-4');
    });
  });

  describe('Gap Spacing', () => {
    it('renders extra small gap', () => {
      const { container } = render(<Grid gap="xs">Content</Grid>);
      const element = container.firstChild as HTMLElement;
      expect(element).toHaveClass('gap-2');
    });

    it('renders small gap', () => {
      const { container } = render(<Grid gap="sm">Content</Grid>);
      const element = container.firstChild as HTMLElement;
      expect(element).toHaveClass('gap-3');
    });

    it('renders medium gap', () => {
      const { container } = render(<Grid gap="md">Content</Grid>);
      const element = container.firstChild as HTMLElement;
      expect(element).toHaveClass('gap-4');
    });

    it('renders large gap', () => {
      const { container } = render(<Grid gap="lg">Content</Grid>);
      const element = container.firstChild as HTMLElement;
      expect(element).toHaveClass('gap-6');
    });

    it('renders extra large gap', () => {
      const { container } = render(<Grid gap="xl">Content</Grid>);
      const element = container.firstChild as HTMLElement;
      expect(element).toHaveClass('gap-8');
    });
  });

  describe('Static Columns', () => {
    it('renders with single column number', () => {
      const { container } = render(<Grid cols={2}>Content</Grid>);
      const element = container.firstChild as HTMLElement;
      expect(element).toHaveClass('grid-cols-2');
    });

    it('renders with 3 columns', () => {
      const { container } = render(<Grid cols={3}>Content</Grid>);
      const element = container.firstChild as HTMLElement;
      expect(element).toHaveClass('grid-cols-3');
    });

    it('renders with 4 columns', () => {
      const { container } = render(<Grid cols={4}>Content</Grid>);
      const element = container.firstChild as HTMLElement;
      expect(element).toHaveClass('grid-cols-4');
    });

    it('supports up to 12 columns', () => {
      const { container } = render(<Grid cols={12}>Content</Grid>);
      const element = container.firstChild as HTMLElement;
      expect(element).toHaveClass('grid-cols-12');
    });
  });

  describe('Responsive Columns', () => {
    it('renders default columns', () => {
      const { container } = render(<Grid cols={{ default: 1 }}>Content</Grid>);
      const element = container.firstChild as HTMLElement;
      expect(element).toHaveClass('grid-cols-1');
    });

    it('renders responsive columns (sm)', () => {
      const { container } = render(<Grid cols={{ default: 1, sm: 2 }}>Content</Grid>);
      const element = container.firstChild as HTMLElement;
      expect(element).toHaveClass('grid-cols-1');
      expect(element.className).toContain('sm:grid-cols-2');
    });

    it('renders responsive columns (md)', () => {
      const { container } = render(<Grid cols={{ default: 1, md: 2 }}>Content</Grid>);
      const element = container.firstChild as HTMLElement;
      expect(element).toHaveClass('grid-cols-1');
      expect(element.className).toContain('md:grid-cols-2');
    });

    it('renders responsive columns (lg)', () => {
      const { container } = render(<Grid cols={{ default: 1, lg: 3 }}>Content</Grid>);
      const element = container.firstChild as HTMLElement;
      expect(element).toHaveClass('grid-cols-1');
      expect(element.className).toContain('lg:grid-cols-3');
    });

    it('renders responsive columns (xl)', () => {
      const { container } = render(<Grid cols={{ default: 1, xl: 4 }}>Content</Grid>);
      const element = container.firstChild as HTMLElement;
      expect(element).toHaveClass('grid-cols-1');
      expect(element.className).toContain('xl:grid-cols-4');
    });

    it('renders responsive columns (2xl)', () => {
      const { container } = render(<Grid cols={{ default: 1, '2xl': 6 }}>Content</Grid>);
      const element = container.firstChild as HTMLElement;
      expect(element).toHaveClass('grid-cols-1');
      expect(element.className).toContain('2xl:grid-cols-6');
    });

    it('renders with default responsive setup', () => {
      const { container } = render(<Grid>Content</Grid>);
      const element = container.firstChild as HTMLElement;
      expect(element).toHaveClass('grid-cols-1');
      expect(element.className).toContain('md:grid-cols-2');
      expect(element.className).toContain('lg:grid-cols-3');
    });

    it('renders with multiple breakpoints', () => {
      const { container } = render(
        <Grid cols={{ default: 1, sm: 2, md: 3, lg: 4, xl: 6 }}>
          Content
        </Grid>
      );
      const element = container.firstChild as HTMLElement;
      expect(element).toHaveClass('grid-cols-1');
      expect(element.className).toContain('sm:grid-cols-2');
      expect(element.className).toContain('md:grid-cols-3');
      expect(element.className).toContain('lg:grid-cols-4');
      expect(element.className).toContain('xl:grid-cols-6');
    });
  });

  describe('Custom Styling', () => {
    it('applies custom className', () => {
      const { container } = render(<Grid className="custom-class">Content</Grid>);
      const element = container.firstChild as HTMLElement;
      expect(element).toHaveClass('custom-class');
    });

    it('maintains base styles with custom className', () => {
      const { container } = render(<Grid className="custom-class">Content</Grid>);
      const element = container.firstChild as HTMLElement;
      expect(element).toHaveClass('grid', 'grid-cols-1', 'custom-class');
    });
  });

  describe('Combined Props', () => {
    it('combines columns and gap', () => {
      const { container } = render(
        <Grid cols={4} gap="lg">
          Content
        </Grid>
      );
      const element = container.firstChild as HTMLElement;
      expect(element).toHaveClass('grid', 'grid-cols-4', 'gap-6');
    });

    it('combines responsive columns and custom gap', () => {
      const { container } = render(
        <Grid cols={{ default: 1, md: 2, lg: 4 }} gap="sm">
          Content
        </Grid>
      );
      const element = container.firstChild as HTMLElement;
      expect(element).toHaveClass('grid', 'grid-cols-1', 'gap-3');
      expect(element.className).toContain('md:grid-cols-2');
      expect(element.className).toContain('lg:grid-cols-4');
    });
  });

  describe('Layout Behavior', () => {
    it('arranges multiple children in grid', () => {
      render(
        <Grid cols={2}>
          <div>Item 1</div>
          <div>Item 2</div>
          <div>Item 3</div>
          <div>Item 4</div>
        </Grid>
      );
      expect(screen.getByText('Item 1')).toBeInTheDocument();
      expect(screen.getByText('Item 2')).toBeInTheDocument();
      expect(screen.getByText('Item 3')).toBeInTheDocument();
      expect(screen.getByText('Item 4')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles single column', () => {
      const { container } = render(<Grid cols={1}>Content</Grid>);
      const element = container.firstChild as HTMLElement;
      expect(element).toHaveClass('grid-cols-1');
    });

    it('handles responsive object without default', () => {
      const { container } = render(<Grid cols={{ md: 2 }}>Content</Grid>);
      const element = container.firstChild as HTMLElement;
      expect(element.className).toContain('md:grid-cols-2');
    });
  });
});
