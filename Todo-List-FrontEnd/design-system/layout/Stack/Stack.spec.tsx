import { describe, it, expect } from 'vitest';
import { render, screen } from '@/test/utils';
import { Stack } from './Stack';

describe('Stack', () => {
  describe('Rendering', () => {
    it('renders children', () => {
      render(
        <Stack>
          <div>Item 1</div>
          <div>Item 2</div>
        </Stack>
      );
      expect(screen.getByText('Item 1')).toBeInTheDocument();
      expect(screen.getByText('Item 2')).toBeInTheDocument();
    });

    it('renders as div element', () => {
      const { container } = render(<Stack>Content</Stack>);
      expect(container.firstChild?.nodeName).toBe('DIV');
    });

    it('uses flexbox', () => {
      const { container } = render(<Stack>Content</Stack>);
      const element = container.firstChild as HTMLElement;
      expect(element).toHaveClass('flex');
    });

    it('defaults to vertical direction', () => {
      const { container } = render(<Stack>Content</Stack>);
      const element = container.firstChild as HTMLElement;
      expect(element).toHaveClass('flex-col');
    });

    it('defaults to medium spacing', () => {
      const { container } = render(<Stack>Content</Stack>);
      const element = container.firstChild as HTMLElement;
      expect(element).toHaveClass('gap-4');
    });

    it('defaults to stretch alignment', () => {
      const { container } = render(<Stack>Content</Stack>);
      const element = container.firstChild as HTMLElement;
      expect(element).toHaveClass('items-stretch');
    });

    it('defaults to start justification', () => {
      const { container } = render(<Stack>Content</Stack>);
      const element = container.firstChild as HTMLElement;
      expect(element).toHaveClass('justify-start');
    });
  });

  describe('Direction', () => {
    it('renders vertical direction', () => {
      const { container } = render(<Stack direction="vertical">Content</Stack>);
      const element = container.firstChild as HTMLElement;
      expect(element).toHaveClass('flex-col');
    });

    it('renders horizontal direction', () => {
      const { container } = render(<Stack direction="horizontal">Content</Stack>);
      const element = container.firstChild as HTMLElement;
      expect(element).toHaveClass('flex-row');
    });
  });

  describe('Spacing', () => {
    it('renders extra small spacing', () => {
      const { container } = render(<Stack spacing="xs">Content</Stack>);
      const element = container.firstChild as HTMLElement;
      expect(element).toHaveClass('gap-2');
    });

    it('renders small spacing', () => {
      const { container } = render(<Stack spacing="sm">Content</Stack>);
      const element = container.firstChild as HTMLElement;
      expect(element).toHaveClass('gap-3');
    });

    it('renders medium spacing', () => {
      const { container } = render(<Stack spacing="md">Content</Stack>);
      const element = container.firstChild as HTMLElement;
      expect(element).toHaveClass('gap-4');
    });

    it('renders large spacing', () => {
      const { container } = render(<Stack spacing="lg">Content</Stack>);
      const element = container.firstChild as HTMLElement;
      expect(element).toHaveClass('gap-6');
    });

    it('renders extra large spacing', () => {
      const { container } = render(<Stack spacing="xl">Content</Stack>);
      const element = container.firstChild as HTMLElement;
      expect(element).toHaveClass('gap-8');
    });
  });

  describe('Alignment (Cross-axis)', () => {
    it('aligns to start', () => {
      const { container } = render(<Stack align="start">Content</Stack>);
      const element = container.firstChild as HTMLElement;
      expect(element).toHaveClass('items-start');
    });

    it('aligns to center', () => {
      const { container } = render(<Stack align="center">Content</Stack>);
      const element = container.firstChild as HTMLElement;
      expect(element).toHaveClass('items-center');
    });

    it('aligns to end', () => {
      const { container } = render(<Stack align="end">Content</Stack>);
      const element = container.firstChild as HTMLElement;
      expect(element).toHaveClass('items-end');
    });

    it('aligns to stretch', () => {
      const { container } = render(<Stack align="stretch">Content</Stack>);
      const element = container.firstChild as HTMLElement;
      expect(element).toHaveClass('items-stretch');
    });
  });

  describe('Justification (Main-axis)', () => {
    it('justifies to start', () => {
      const { container } = render(<Stack justify="start">Content</Stack>);
      const element = container.firstChild as HTMLElement;
      expect(element).toHaveClass('justify-start');
    });

    it('justifies to center', () => {
      const { container } = render(<Stack justify="center">Content</Stack>);
      const element = container.firstChild as HTMLElement;
      expect(element).toHaveClass('justify-center');
    });

    it('justifies to end', () => {
      const { container } = render(<Stack justify="end">Content</Stack>);
      const element = container.firstChild as HTMLElement;
      expect(element).toHaveClass('justify-end');
    });

    it('justifies with space-between', () => {
      const { container } = render(<Stack justify="between">Content</Stack>);
      const element = container.firstChild as HTMLElement;
      expect(element).toHaveClass('justify-between');
    });

    it('justifies with space-around', () => {
      const { container } = render(<Stack justify="around">Content</Stack>);
      const element = container.firstChild as HTMLElement;
      expect(element).toHaveClass('justify-around');
    });

    it('justifies with space-evenly', () => {
      const { container } = render(<Stack justify="evenly">Content</Stack>);
      const element = container.firstChild as HTMLElement;
      expect(element).toHaveClass('justify-evenly');
    });
  });

  describe('Wrapping', () => {
    it('does not wrap by default', () => {
      const { container } = render(<Stack>Content</Stack>);
      const element = container.firstChild as HTMLElement;
      expect(element).toHaveClass('flex-nowrap');
    });

    it('wraps when wrap is true', () => {
      const { container } = render(<Stack wrap>Content</Stack>);
      const element = container.firstChild as HTMLElement;
      expect(element).toHaveClass('flex-wrap');
    });

    it('does not wrap when wrap is false', () => {
      const { container } = render(<Stack wrap={false}>Content</Stack>);
      const element = container.firstChild as HTMLElement;
      expect(element).toHaveClass('flex-nowrap');
    });
  });

  describe('Custom Styling', () => {
    it('applies custom className', () => {
      const { container } = render(<Stack className="custom-class">Content</Stack>);
      const element = container.firstChild as HTMLElement;
      expect(element).toHaveClass('custom-class');
    });

    it('maintains base styles with custom className', () => {
      const { container } = render(<Stack className="custom-class">Content</Stack>);
      const element = container.firstChild as HTMLElement;
      expect(element).toHaveClass('flex', 'flex-col', 'custom-class');
    });
  });

  describe('Combined Props', () => {
    it('combines direction, spacing, and alignment', () => {
      const { container } = render(
        <Stack direction="horizontal" spacing="lg" align="center" justify="between">
          Content
        </Stack>
      );
      const element = container.firstChild as HTMLElement;
      expect(element).toHaveClass('flex-row', 'gap-6', 'items-center', 'justify-between');
    });

    it('works with all props combined', () => {
      const { container } = render(
        <Stack
          direction="vertical"
          spacing="sm"
          align="start"
          justify="end"
          wrap
          className="custom"
        >
          Content
        </Stack>
      );
      const element = container.firstChild as HTMLElement;
      expect(element).toHaveClass(
        'flex',
        'flex-col',
        'gap-3',
        'items-start',
        'justify-end',
        'flex-wrap',
        'custom'
      );
    });
  });
});
