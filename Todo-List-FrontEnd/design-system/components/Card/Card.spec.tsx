import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@/test/utils';
import userEvent from '@testing-library/user-event';
import { Card } from './Card';

describe('Card', () => {
  describe('Rendering', () => {
    it('renders children', () => {
      render(<Card>Card content</Card>);
      expect(screen.getByText('Card content')).toBeInTheDocument();
    });

    it('renders with header', () => {
      render(
        <Card header={<h3>Card Header</h3>}>
          Card content
        </Card>
      );
      expect(screen.getByText('Card Header')).toBeInTheDocument();
    });

    it('renders with footer', () => {
      render(
        <Card footer={<div>Card Footer</div>}>
          Card content
        </Card>
      );
      expect(screen.getByText('Card Footer')).toBeInTheDocument();
    });

    it('renders with header and footer', () => {
      render(
        <Card
          header={<h3>Header</h3>}
          footer={<div>Footer</div>}
        >
          Content
        </Card>
      );
      expect(screen.getByText('Header')).toBeInTheDocument();
      expect(screen.getByText('Content')).toBeInTheDocument();
      expect(screen.getByText('Footer')).toBeInTheDocument();
    });
  });

  describe('Variants', () => {
    it('renders default variant', () => {
      const { container } = render(<Card>Default Card</Card>);
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('border', 'border-neutral-200', 'shadow-sm');
    });

    it('renders hover variant', () => {
      const { container } = render(<Card variant="hover">Hover Card</Card>);
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('hover:shadow-md');
    });

    it('renders interactive variant', () => {
      const { container } = render(<Card variant="interactive">Interactive Card</Card>);
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('cursor-pointer');
      expect(card).toHaveAttribute('role', 'button');
      expect(card).toHaveAttribute('tabIndex', '0');
    });

    it('renders outlined variant', () => {
      const { container } = render(<Card variant="outlined">Outlined Card</Card>);
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('border-2', 'border-neutral-300');
    });
  });

  describe('Padding', () => {
    it('applies default padding', () => {
      render(<Card>Content</Card>);
      const content = screen.getByText('Content');
      expect(content).toHaveClass('p-6');
    });

    it('applies custom padding', () => {
      render(<Card padding="p-8">Content</Card>);
      const content = screen.getByText('Content');
      expect(content).toHaveClass('p-8');
    });

    it('removes padding when noPadding is true', () => {
      render(<Card noPadding>Content</Card>);
      const content = screen.getByText('Content');
      expect(content).not.toHaveClass('p-6');
    });

    it('applies padding to header when noPadding is true', () => {
      render(
        <Card noPadding header={<div>Header</div>}>
          Content
        </Card>
      );
      const header = screen.getByText('Header');
      expect(header.parentElement).toHaveClass('px-6', 'py-4');
    });

    it('applies padding to footer when noPadding is true', () => {
      render(
        <Card noPadding footer={<div>Footer</div>}>
          Content
        </Card>
      );
      const footer = screen.getByText('Footer');
      expect(footer.parentElement).toHaveClass('px-6', 'py-4');
    });
  });

  describe('Interaction', () => {
    it('handles click events', async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();

      render(<Card onClick={handleClick}>Clickable Card</Card>);
      const card = screen.getByText('Clickable Card').parentElement;

      if (card) {
        await user.click(card);
        expect(handleClick).toHaveBeenCalledTimes(1);
      }
    });

    it('becomes interactive when onClick is provided', () => {
      const handleClick = vi.fn();
      render(<Card onClick={handleClick}>Card</Card>);
      const card = screen.getByRole('button');

      // The card should be focusable and have proper ARIA attributes
      expect(card).toHaveAttribute('role', 'button');
      expect(card).toHaveAttribute('tabIndex', '0');

      // Verify it's clickable (has onClick handler)
      expect(card).toHaveProperty('onclick');
    });

    it('handles Enter key press', async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();

      render(<Card onClick={handleClick}>Interactive Card</Card>);
      const card = screen.getByRole('button');

      card.focus();
      await user.keyboard('{Enter}');

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('handles Space key press', async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();

      render(<Card onClick={handleClick}>Interactive Card</Card>);
      const card = screen.getByRole('button');

      card.focus();
      await user.keyboard(' ');

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('does not handle other key presses', async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();

      render(<Card onClick={handleClick}>Interactive Card</Card>);
      const card = screen.getByRole('button');

      card.focus();
      await user.keyboard('a');

      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('has button role when interactive', () => {
      render(<Card variant="interactive">Interactive</Card>);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('is keyboard accessible when interactive', () => {
      render(<Card variant="interactive">Interactive</Card>);
      const card = screen.getByRole('button');
      expect(card).toHaveAttribute('tabIndex', '0');
    });

    it('does not have button role when not interactive', () => {
      render(<Card>Regular Card</Card>);
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('is not keyboard accessible when not interactive', () => {
      const { container } = render(<Card>Regular Card</Card>);
      const card = container.firstChild as HTMLElement;
      expect(card).not.toHaveAttribute('tabIndex');
    });

    it('supports ref forwarding', () => {
      const ref = vi.fn();
      render(<Card ref={ref}>Content</Card>);
      expect(ref).toHaveBeenCalled();
    });
  });

  describe('Custom Styling', () => {
    it('applies custom className', () => {
      const { container } = render(<Card className="custom-class">Content</Card>);
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('custom-class');
    });

    it('maintains base styles with custom className', () => {
      const { container } = render(<Card className="custom-class">Content</Card>);
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('bg-white', 'rounded-lg', 'custom-class');
    });
  });

  describe('Structure', () => {
    it('has proper header border', () => {
      render(
        <Card header={<div>Header</div>}>
          Content
        </Card>
      );
      const header = screen.getByText('Header').parentElement;
      expect(header).toHaveClass('border-b', 'border-neutral-200');
    });

    it('has proper footer border', () => {
      render(
        <Card footer={<div>Footer</div>}>
          Content
        </Card>
      );
      const footer = screen.getByText('Footer').parentElement;
      expect(footer).toHaveClass('border-t', 'border-neutral-200');
    });
  });
});
