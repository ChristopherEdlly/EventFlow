import { describe, it, expect } from 'vitest';
import { render, screen } from '@/test/utils';
import { Badge } from './Badge';

describe('Badge', () => {
  describe('Rendering', () => {
    it('renders with children', () => {
      render(<Badge>Active</Badge>);
      expect(screen.getByText('Active')).toBeInTheDocument();
    });

    it('renders with default variant (neutral)', () => {
      const { container } = render(<Badge>Neutral</Badge>);
      const badge = container.firstChild as HTMLElement;
      expect(badge).toHaveClass('bg-neutral-100', 'text-neutral-800');
    });

    it('renders with default size (md)', () => {
      const { container } = render(<Badge>Medium</Badge>);
      const badge = container.firstChild as HTMLElement;
      expect(badge).toHaveClass('px-2.5', 'py-1', 'text-sm');
    });

    it('renders as pill by default', () => {
      const { container } = render(<Badge>Pill</Badge>);
      const badge = container.firstChild as HTMLElement;
      expect(badge).toHaveClass('rounded-full');
    });
  });

  describe('Variants', () => {
    it('renders primary variant', () => {
      const { container } = render(<Badge variant="primary">Primary</Badge>);
      const badge = container.firstChild as HTMLElement;
      expect(badge).toHaveClass('bg-primary-100', 'text-primary-800');
    });

    it('renders secondary variant', () => {
      const { container } = render(<Badge variant="secondary">Secondary</Badge>);
      const badge = container.firstChild as HTMLElement;
      expect(badge).toHaveClass('bg-secondary-100', 'text-secondary-800');
    });

    it('renders success variant', () => {
      const { container } = render(<Badge variant="success">Success</Badge>);
      const badge = container.firstChild as HTMLElement;
      expect(badge).toHaveClass('bg-success-100', 'text-success-800');
    });

    it('renders warning variant', () => {
      const { container } = render(<Badge variant="warning">Warning</Badge>);
      const badge = container.firstChild as HTMLElement;
      expect(badge).toHaveClass('bg-warning-100', 'text-warning-800');
    });

    it('renders danger variant', () => {
      const { container } = render(<Badge variant="danger">Danger</Badge>);
      const badge = container.firstChild as HTMLElement;
      expect(badge).toHaveClass('bg-error-100', 'text-error-800');
    });

    it('renders info variant', () => {
      const { container } = render(<Badge variant="info">Info</Badge>);
      const badge = container.firstChild as HTMLElement;
      expect(badge).toHaveClass('bg-info-100', 'text-info-800');
    });

    it('renders neutral variant', () => {
      const { container } = render(<Badge variant="neutral">Neutral</Badge>);
      const badge = container.firstChild as HTMLElement;
      expect(badge).toHaveClass('bg-neutral-100', 'text-neutral-800');
    });
  });

  describe('Sizes', () => {
    it('renders small size', () => {
      const { container } = render(<Badge size="sm">Small</Badge>);
      const badge = container.firstChild as HTMLElement;
      expect(badge).toHaveClass('px-2', 'py-0.5', 'text-xs');
    });

    it('renders medium size', () => {
      const { container } = render(<Badge size="md">Medium</Badge>);
      const badge = container.firstChild as HTMLElement;
      expect(badge).toHaveClass('px-2.5', 'py-1', 'text-sm');
    });

    it('renders large size', () => {
      const { container } = render(<Badge size="lg">Large</Badge>);
      const badge = container.firstChild as HTMLElement;
      expect(badge).toHaveClass('px-3', 'py-1.5', 'text-base');
    });
  });

  describe('Shape', () => {
    it('renders as pill when pill is true', () => {
      const { container } = render(<Badge pill>Pill</Badge>);
      const badge = container.firstChild as HTMLElement;
      expect(badge).toHaveClass('rounded-full');
      expect(badge).not.toHaveClass('rounded-md');
    });

    it('renders as rounded when pill is false', () => {
      const { container } = render(<Badge pill={false}>Rounded</Badge>);
      const badge = container.firstChild as HTMLElement;
      expect(badge).toHaveClass('rounded-md');
      expect(badge).not.toHaveClass('rounded-full');
    });
  });

  describe('Dot Indicator', () => {
    it('does not show dot by default', () => {
      const { container } = render(<Badge>No Dot</Badge>);
      const badge = container.firstChild as HTMLElement;
      const dot = badge.querySelector('span[aria-hidden="true"]');
      expect(dot).not.toBeInTheDocument();
    });

    it('shows dot when dot prop is true', () => {
      const { container } = render(<Badge dot>With Dot</Badge>);
      const badge = container.firstChild as HTMLElement;
      const dot = badge.querySelector('span[aria-hidden="true"]');
      expect(dot).toBeInTheDocument();
    });

    it('applies gap when dot is present', () => {
      const { container } = render(<Badge dot>With Dot</Badge>);
      const badge = container.firstChild as HTMLElement;
      expect(badge).toHaveClass('gap-1.5');
    });

    it('dot has correct size for small badge', () => {
      const { container } = render(<Badge dot size="sm">Small Dot</Badge>);
      const badge = container.firstChild as HTMLElement;
      const dot = badge.querySelector('span[aria-hidden="true"]');
      expect(dot).toHaveClass('w-1.5', 'h-1.5');
    });

    it('dot has correct size for medium badge', () => {
      const { container } = render(<Badge dot size="md">Medium Dot</Badge>);
      const badge = container.firstChild as HTMLElement;
      const dot = badge.querySelector('span[aria-hidden="true"]');
      expect(dot).toHaveClass('w-2', 'h-2');
    });

    it('dot has correct size for large badge', () => {
      const { container } = render(<Badge dot size="lg">Large Dot</Badge>);
      const badge = container.firstChild as HTMLElement;
      const dot = badge.querySelector('span[aria-hidden="true"]');
      expect(dot).toHaveClass('w-2.5', 'h-2.5');
    });

    it('dot matches variant color', () => {
      const { container } = render(<Badge dot variant="success">Success</Badge>);
      const badge = container.firstChild as HTMLElement;
      const dot = badge.querySelector('span[aria-hidden="true"]');
      expect(dot).toHaveClass('bg-success-600');
    });

    it('dot is hidden from screen readers', () => {
      const { container } = render(<Badge dot>With Dot</Badge>);
      const badge = container.firstChild as HTMLElement;
      const dot = badge.querySelector('span[aria-hidden="true"]');
      expect(dot).toHaveAttribute('aria-hidden', 'true');
    });
  });

  describe('Custom Styling', () => {
    it('applies custom className', () => {
      const { container } = render(<Badge className="custom-class">Custom</Badge>);
      const badge = container.firstChild as HTMLElement;
      expect(badge).toHaveClass('custom-class');
    });

    it('maintains base styles with custom className', () => {
      const { container } = render(<Badge className="custom-class">Custom</Badge>);
      const badge = container.firstChild as HTMLElement;
      expect(badge).toHaveClass('inline-flex', 'items-center', 'custom-class');
    });
  });

  describe('Accessibility', () => {
    it('renders as span element', () => {
      const { container } = render(<Badge>Badge</Badge>);
      const badge = container.firstChild as HTMLElement;
      expect(badge.tagName).toBe('SPAN');
    });

    it('has inline-flex display for proper alignment', () => {
      const { container } = render(<Badge>Badge</Badge>);
      const badge = container.firstChild as HTMLElement;
      expect(badge).toHaveClass('inline-flex', 'items-center', 'justify-center');
    });
  });
});
