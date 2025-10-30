import { describe, it, expect } from 'vitest';
import { render, screen } from '@/test/utils';
import { Spinner } from './Spinner';

describe('Spinner', () => {
  describe('Rendering', () => {
    it('renders with default props', () => {
      render(<Spinner />);
      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('renders with default label', () => {
      render(<Spinner />);
      expect(screen.getByLabelText('Loading')).toBeInTheDocument();
    });

    it('renders with custom label', () => {
      render(<Spinner label="Processing" />);
      expect(screen.getByLabelText('Processing')).toBeInTheDocument();
    });

    it('renders with default size (md)', () => {
      const { container } = render(<Spinner />);
      const spinner = container.firstChild as HTMLElement;
      expect(spinner).toHaveClass('w-6', 'h-6');
    });

    it('renders with default color (primary)', () => {
      const { container } = render(<Spinner />);
      const spinner = container.firstChild as HTMLElement;
      expect(spinner).toHaveClass('border-primary-200', 'border-t-primary-600');
    });
  });

  describe('Sizes', () => {
    it('renders extra small size', () => {
      const { container } = render(<Spinner size="xs" />);
      const spinner = container.firstChild as HTMLElement;
      expect(spinner).toHaveClass('w-3', 'h-3', 'border-2');
    });

    it('renders small size', () => {
      const { container } = render(<Spinner size="sm" />);
      const spinner = container.firstChild as HTMLElement;
      expect(spinner).toHaveClass('w-4', 'h-4', 'border-2');
    });

    it('renders medium size', () => {
      const { container } = render(<Spinner size="md" />);
      const spinner = container.firstChild as HTMLElement;
      expect(spinner).toHaveClass('w-6', 'h-6', 'border-2');
    });

    it('renders large size', () => {
      const { container } = render(<Spinner size="lg" />);
      const spinner = container.firstChild as HTMLElement;
      expect(spinner).toHaveClass('w-8', 'h-8', 'border-3');
    });

    it('renders extra large size', () => {
      const { container } = render(<Spinner size="xl" />);
      const spinner = container.firstChild as HTMLElement;
      expect(spinner).toHaveClass('w-12', 'h-12', 'border-4');
    });
  });

  describe('Colors', () => {
    it('renders primary color', () => {
      const { container } = render(<Spinner color="primary" />);
      const spinner = container.firstChild as HTMLElement;
      expect(spinner).toHaveClass('border-primary-200', 'border-t-primary-600');
    });

    it('renders secondary color', () => {
      const { container } = render(<Spinner color="secondary" />);
      const spinner = container.firstChild as HTMLElement;
      expect(spinner).toHaveClass('border-secondary-200', 'border-t-secondary-600');
    });

    it('renders white color', () => {
      const { container } = render(<Spinner color="white" />);
      const spinner = container.firstChild as HTMLElement;
      expect(spinner).toHaveClass('border-white/20', 'border-t-white');
    });
  });

  describe('Animation', () => {
    it('has spin animation', () => {
      const { container } = render(<Spinner />);
      const spinner = container.firstChild as HTMLElement;
      expect(spinner).toHaveClass('animate-spin');
    });

    it('is circular', () => {
      const { container } = render(<Spinner />);
      const spinner = container.firstChild as HTMLElement;
      expect(spinner).toHaveClass('rounded-full');
    });
  });

  describe('Accessibility', () => {
    it('has status role', () => {
      render(<Spinner />);
      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('has aria-label', () => {
      render(<Spinner label="Loading data" />);
      const spinner = screen.getByRole('status');
      expect(spinner).toHaveAttribute('aria-label', 'Loading data');
    });

    it('has aria-live polite', () => {
      const { container } = render(<Spinner />);
      const spinner = container.firstChild as HTMLElement;
      expect(spinner).toHaveAttribute('aria-live', 'polite');
    });

    it('has screen reader only text', () => {
      render(<Spinner label="Processing" />);
      const srText = screen.getByText('Processing');
      expect(srText).toHaveClass('sr-only');
    });

    it('screen reader text matches label prop', () => {
      render(<Spinner label="Custom loading" />);
      expect(screen.getByText('Custom loading')).toBeInTheDocument();
    });
  });

  describe('Custom Styling', () => {
    it('applies custom className', () => {
      const { container } = render(<Spinner className="custom-class" />);
      const spinner = container.firstChild as HTMLElement;
      expect(spinner).toHaveClass('custom-class');
    });

    it('maintains base styles with custom className', () => {
      const { container } = render(<Spinner className="custom-class" />);
      const spinner = container.firstChild as HTMLElement;
      expect(spinner).toHaveClass('inline-block', 'rounded-full', 'animate-spin', 'custom-class');
    });
  });

  describe('Display', () => {
    it('renders as inline-block', () => {
      const { container } = render(<Spinner />);
      const spinner = container.firstChild as HTMLElement;
      expect(spinner).toHaveClass('inline-block');
    });

    it('renders as div element', () => {
      const { container } = render(<Spinner />);
      const spinner = container.firstChild as HTMLElement;
      expect(spinner.tagName).toBe('DIV');
    });
  });
});
