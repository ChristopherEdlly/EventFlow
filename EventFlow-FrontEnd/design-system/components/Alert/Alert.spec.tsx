import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@/test/utils';
import userEvent from '@testing-library/user-event';
import { Alert } from './Alert';

describe('Alert', () => {
  describe('Rendering', () => {
    it('renders with children', () => {
      render(<Alert>Alert message</Alert>);
      expect(screen.getByText('Alert message')).toBeInTheDocument();
    });

    it('renders with title', () => {
      render(<Alert title="Alert Title">Alert message</Alert>);
      expect(screen.getByText('Alert Title')).toBeInTheDocument();
    });

    it('renders with title and children', () => {
      render(<Alert title="Success!">Operation completed</Alert>);
      expect(screen.getByText('Success!')).toBeInTheDocument();
      expect(screen.getByText('Operation completed')).toBeInTheDocument();
    });

    it('renders with default variant (info)', () => {
      const { container } = render(<Alert>Info alert</Alert>);
      const alert = container.firstChild as HTMLElement;
      expect(alert).toHaveClass('bg-info-50', 'border-info-200');
    });

    it('shows icon by default', () => {
      const { container } = render(<Alert>Alert with icon</Alert>);
      const alert = container.firstChild as HTMLElement;
      const icon = alert.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });
  });

  describe('Variants', () => {
    it('renders success variant', () => {
      const { container } = render(<Alert variant="success">Success!</Alert>);
      const alert = container.firstChild as HTMLElement;
      expect(alert).toHaveClass('bg-success-50', 'border-success-200');
    });

    it('renders error variant', () => {
      const { container } = render(<Alert variant="error">Error!</Alert>);
      const alert = container.firstChild as HTMLElement;
      expect(alert).toHaveClass('bg-error-50', 'border-error-200');
    });

    it('renders warning variant', () => {
      const { container } = render(<Alert variant="warning">Warning!</Alert>);
      const alert = container.firstChild as HTMLElement;
      expect(alert).toHaveClass('bg-warning-50', 'border-warning-200');
    });

    it('renders info variant', () => {
      const { container } = render(<Alert variant="info">Info!</Alert>);
      const alert = container.firstChild as HTMLElement;
      expect(alert).toHaveClass('bg-info-50', 'border-info-200');
    });
  });

  describe('Icon', () => {
    it('shows default icon for each variant', () => {
      const { container } = render(<Alert variant="success">Success</Alert>);
      const alert = container.firstChild as HTMLElement;
      const icon = alert.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });

    it('hides icon when hideIcon is true', () => {
      const { container } = render(<Alert hideIcon>No icon</Alert>);
      const alert = container.firstChild as HTMLElement;
      const icon = alert.querySelector('svg');
      expect(icon).not.toBeInTheDocument();
    });

    it('renders custom icon', () => {
      render(
        <Alert icon={<span data-testid="custom-icon">Custom</span>}>
          Alert with custom icon
        </Alert>
      );
      expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
    });
  });

  describe('Dismissible', () => {
    it('is not dismissible by default', () => {
      render(<Alert>Not dismissible</Alert>);
      expect(screen.queryByRole('button', { name: /dismiss/i })).not.toBeInTheDocument();
    });

    it('shows close button when onClose is provided', () => {
      const handleClose = vi.fn();
      render(<Alert onClose={handleClose}>Dismissible alert</Alert>);
      expect(screen.getByRole('button', { name: /dismiss/i })).toBeInTheDocument();
    });

    it('calls onClose when close button is clicked', async () => {
      const handleClose = vi.fn();
      const user = userEvent.setup();

      render(<Alert onClose={handleClose}>Dismissible alert</Alert>);
      const closeButton = screen.getByRole('button', { name: /dismiss/i });

      await user.click(closeButton);
      expect(handleClose).toHaveBeenCalledTimes(1);
    });

    it('close button has proper aria-label', () => {
      const handleClose = vi.fn();
      render(<Alert onClose={handleClose}>Dismissible</Alert>);
      const closeButton = screen.getByRole('button');
      expect(closeButton).toHaveAttribute('aria-label', 'Dismiss alert');
    });
  });

  describe('Accessibility', () => {
    it('has alert role for error variant', () => {
      render(<Alert variant="error">Error message</Alert>);
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    it('has status role for non-error variants', () => {
      render(<Alert variant="success">Success message</Alert>);
      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('has assertive aria-live for error variant', () => {
      const { container } = render(<Alert variant="error">Error</Alert>);
      const alert = container.firstChild as HTMLElement;
      expect(alert).toHaveAttribute('aria-live', 'assertive');
    });

    it('has polite aria-live for non-error variants', () => {
      const { container } = render(<Alert variant="success">Success</Alert>);
      const alert = container.firstChild as HTMLElement;
      expect(alert).toHaveAttribute('aria-live', 'polite');
    });

    it('has polite aria-live for info variant', () => {
      const { container } = render(<Alert variant="info">Info</Alert>);
      const alert = container.firstChild as HTMLElement;
      expect(alert).toHaveAttribute('aria-live', 'polite');
    });

    it('has polite aria-live for warning variant', () => {
      const { container } = render(<Alert variant="warning">Warning</Alert>);
      const alert = container.firstChild as HTMLElement;
      expect(alert).toHaveAttribute('aria-live', 'polite');
    });
  });

  describe('Structure', () => {
    it('has proper layout classes', () => {
      const { container } = render(<Alert>Alert</Alert>);
      const alert = container.firstChild as HTMLElement;
      expect(alert).toHaveClass('flex', 'gap-3', 'rounded-lg', 'border', 'p-4');
    });

    it('title has proper styling', () => {
      render(<Alert title="Title">Content</Alert>);
      const title = screen.getByText('Title');
      expect(title.tagName).toBe('H3');
      expect(title).toHaveClass('font-semibold', 'mb-1');
    });

    it('content wrapper has proper text size', () => {
      render(<Alert>Content</Alert>);
      const content = screen.getByText('Content');
      // The text-sm class is on the div wrapper, not the direct parent
      const textWrapper = content.closest('.text-sm');
      expect(textWrapper).toBeInTheDocument();
    });
  });

  describe('Custom Styling', () => {
    it('applies custom className', () => {
      const { container } = render(<Alert className="custom-class">Alert</Alert>);
      const alert = container.firstChild as HTMLElement;
      expect(alert).toHaveClass('custom-class');
    });

    it('maintains base styles with custom className', () => {
      const { container } = render(<Alert className="custom-class">Alert</Alert>);
      const alert = container.firstChild as HTMLElement;
      expect(alert).toHaveClass('rounded-lg', 'border', 'custom-class');
    });
  });

  describe('Close Button Interaction', () => {
    it('close button has hover styles', () => {
      const handleClose = vi.fn();
      render(<Alert onClose={handleClose}>Alert</Alert>);
      const closeButton = screen.getByRole('button');
      expect(closeButton).toHaveClass('hover:bg-black/5');
    });

    it('close button has focus styles', () => {
      const handleClose = vi.fn();
      render(<Alert onClose={handleClose}>Alert</Alert>);
      const closeButton = screen.getByRole('button');
      expect(closeButton).toHaveClass('focus:outline-none', 'focus:ring-2');
    });

    it('close button has proper type', () => {
      const handleClose = vi.fn();
      render(<Alert onClose={handleClose}>Alert</Alert>);
      const closeButton = screen.getByRole('button');
      expect(closeButton).toHaveAttribute('type', 'button');
    });
  });
});
