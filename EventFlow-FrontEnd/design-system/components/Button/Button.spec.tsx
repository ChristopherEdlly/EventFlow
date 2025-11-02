import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@/test/utils';
import userEvent from '@testing-library/user-event';
import { Button } from './Button';

describe('Button', () => {
  describe('Rendering', () => {
    it('renders with children', () => {
      render(<Button>Click me</Button>);
      expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
    });

    it('renders with default variant (primary)', () => {
      render(<Button>Primary Button</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-primary-600');
    });

    it('renders with custom variant', () => {
      render(<Button variant="secondary">Secondary</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-secondary-600');
    });

    it('renders danger variant', () => {
      render(<Button variant="danger">Delete</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-error-600');
    });

    it('renders outline variant', () => {
      render(<Button variant="outline">Outline</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('border-2');
    });

    it('renders ghost variant', () => {
      render(<Button variant="ghost">Ghost</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-transparent');
    });
  });

  describe('Sizes', () => {
    it('applies small size styles', () => {
      render(<Button size="sm">Small</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('px-3', 'py-1.5', 'text-sm');
    });

    it('applies medium size styles (default)', () => {
      render(<Button size="md">Medium</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('px-4', 'py-2.5', 'text-base');
    });

    it('applies large size styles', () => {
      render(<Button size="lg">Large</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('px-6', 'py-3', 'text-lg');
    });
  });

  describe('Interaction', () => {
    it('handles click events', async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();

      render(<Button onClick={handleClick}>Click me</Button>);
      await user.click(screen.getByRole('button'));

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('does not call onClick when disabled', async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();

      render(<Button disabled onClick={handleClick}>Disabled</Button>);
      const button = screen.getByRole('button');

      await user.click(button);
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('does not call onClick when loading', async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();

      render(<Button loading onClick={handleClick}>Loading</Button>);
      const button = screen.getByRole('button');

      await user.click(button);
      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe('States', () => {
    it('disables button when disabled prop is true', () => {
      render(<Button disabled>Disabled</Button>);
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      expect(button).toHaveClass('disabled:opacity-50');
    });

    it('shows loading state with spinner', () => {
      render(<Button loading>Loading</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-busy', 'true');
      expect(button).toBeDisabled();
    });

    it('hides icons when loading', () => {
      render(
        <Button loading leftIcon={<span data-testid="left-icon">L</span>}>
          Loading
        </Button>
      );
      expect(screen.queryByTestId('left-icon')).not.toBeInTheDocument();
    });
  });

  describe('Layout', () => {
    it('applies fullWidth class', () => {
      render(<Button fullWidth>Full Width</Button>);
      expect(screen.getByRole('button')).toHaveClass('w-full');
    });

    it('renders with left icon', () => {
      render(
        <Button leftIcon={<span data-testid="icon">Icon</span>}>
          With Icon
        </Button>
      );
      expect(screen.getByTestId('icon')).toBeInTheDocument();
    });

    it('renders with right icon', () => {
      render(
        <Button rightIcon={<span data-testid="icon">Icon</span>}>
          With Icon
        </Button>
      );
      expect(screen.getByTestId('icon')).toBeInTheDocument();
    });

    it('renders with both icons', () => {
      render(
        <Button
          leftIcon={<span data-testid="left-icon">L</span>}
          rightIcon={<span data-testid="right-icon">R</span>}
        >
          Both Icons
        </Button>
      );
      expect(screen.getByTestId('left-icon')).toBeInTheDocument();
      expect(screen.getByTestId('right-icon')).toBeInTheDocument();
    });
  });

  describe('HTML Attributes', () => {
    it('defaults to button type', () => {
      render(<Button>Button</Button>);
      expect(screen.getByRole('button')).toHaveAttribute('type', 'button');
    });

    it('accepts submit type', () => {
      render(<Button type="submit">Submit</Button>);
      expect(screen.getByRole('button')).toHaveAttribute('type', 'submit');
    });

    it('accepts custom className', () => {
      render(<Button className="custom-class">Custom</Button>);
      expect(screen.getByRole('button')).toHaveClass('custom-class');
    });

    it('spreads additional props', () => {
      render(<Button data-testid="custom-button">Custom</Button>);
      expect(screen.getByTestId('custom-button')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('maintains focus ring classes', () => {
      render(<Button>Focus Test</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('focus:outline-none', 'focus:ring-2');
    });

    it('has proper aria-busy attribute when loading', () => {
      render(<Button loading>Loading</Button>);
      expect(screen.getByRole('button')).toHaveAttribute('aria-busy', 'true');
    });

    it('has proper aria-busy attribute when not loading', () => {
      render(<Button>Not Loading</Button>);
      expect(screen.getByRole('button')).toHaveAttribute('aria-busy', 'false');
    });

    it('supports ref forwarding', () => {
      const ref = vi.fn();
      render(<Button ref={ref}>Ref Test</Button>);
      expect(ref).toHaveBeenCalled();
    });
  });
});
