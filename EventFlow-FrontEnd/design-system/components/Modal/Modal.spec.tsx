import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@/test/utils';
import userEvent from '@testing-library/user-event';
import { Modal } from './Modal';

describe('Modal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
  };

  beforeEach(() => {
    // Clear any previous modals
    document.body.innerHTML = '';
  });

  afterEach(() => {
    // Restore body overflow
    document.body.style.overflow = '';
  });

  describe('Rendering', () => {
    it('does not render when isOpen is false', () => {
      render(<Modal isOpen={false} onClose={vi.fn()}>Content</Modal>);
      expect(screen.queryByText('Content')).not.toBeInTheDocument();
    });

    it('renders when isOpen is true', () => {
      render(<Modal {...defaultProps}>Modal content</Modal>);
      expect(screen.getByText('Modal content')).toBeInTheDocument();
    });

    it('renders with title', () => {
      render(
        <Modal {...defaultProps} title="Modal Title">
          Content
        </Modal>
      );
      expect(screen.getByText('Modal Title')).toBeInTheDocument();
    });

    it('renders with footer', () => {
      render(
        <Modal {...defaultProps} footer={<div>Footer content</div>}>
          Content
        </Modal>
      );
      expect(screen.getByText('Footer content')).toBeInTheDocument();
    });

    it('renders close button by default', () => {
      render(<Modal {...defaultProps}>Content</Modal>);
      expect(screen.getByRole('button', { name: /close modal/i })).toBeInTheDocument();
    });

    it('hides close button when hideCloseButton is true', () => {
      render(
        <Modal {...defaultProps} hideCloseButton>
          Content
        </Modal>
      );
      expect(screen.queryByRole('button', { name: /close modal/i })).not.toBeInTheDocument();
    });
  });

  describe('Sizes', () => {
    it('renders small size', () => {
      render(
        <Modal {...defaultProps} size="sm">
          Content
        </Modal>
      );
      const modal = document.body.querySelector('.max-w-sm');
      expect(modal).toBeInTheDocument();
    });

    it('renders medium size (default)', () => {
      render(<Modal {...defaultProps}>Content</Modal>);
      const modal = document.body.querySelector('.max-w-md');
      expect(modal).toBeInTheDocument();
    });

    it('renders large size', () => {
      render(
        <Modal {...defaultProps} size="lg">
          Content
        </Modal>
      );
      const modal = document.body.querySelector('.max-w-lg');
      expect(modal).toBeInTheDocument();
    });

    it('renders extra large size', () => {
      render(
        <Modal {...defaultProps} size="xl">
          Content
        </Modal>
      );
      const modal = document.body.querySelector('.max-w-xl');
      expect(modal).toBeInTheDocument();
    });

    it('renders full size', () => {
      render(
        <Modal {...defaultProps} size="full">
          Content
        </Modal>
      );
      const modal = document.body.querySelector('.max-w-full');
      expect(modal).toBeInTheDocument();
    });
  });

  describe('Close Interaction', () => {
    it('calls onClose when close button is clicked', async () => {
      const onClose = vi.fn();
      const user = userEvent.setup();

      render(
        <Modal isOpen onClose={onClose}>
          Content
        </Modal>
      );

      const closeButton = screen.getByRole('button', { name: /close modal/i });
      await user.click(closeButton);

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('calls onClose when backdrop is clicked', async () => {
      const onClose = vi.fn();
      const user = userEvent.setup();

      render(
        <Modal isOpen onClose={onClose}>
          Content
        </Modal>
      );

      // Click on the outer wrapper div that handles backdrop clicks
      const backdropWrapper = document.querySelector('.fixed.inset-0.z-modal');
      if (backdropWrapper) {
        await user.click(backdropWrapper as HTMLElement);
        expect(onClose).toHaveBeenCalledTimes(1);
      }
    });

    it('does not close when backdrop is clicked and closeOnBackdrop is false', async () => {
      const onClose = vi.fn();
      const user = userEvent.setup();

      render(
        <Modal isOpen onClose={onClose} closeOnBackdrop={false}>
          Content
        </Modal>
      );

      const backdrop = screen.getByRole('dialog').parentElement;
      if (backdrop) {
        await user.click(backdrop);
        expect(onClose).not.toHaveBeenCalled();
      }
    });

    it('does not close when modal content is clicked', async () => {
      const onClose = vi.fn();
      const user = userEvent.setup();

      render(
        <Modal isOpen onClose={onClose}>
          Content
        </Modal>
      );

      const content = screen.getByText('Content');
      await user.click(content);

      expect(onClose).not.toHaveBeenCalled();
    });
  });

  describe('Keyboard Interaction', () => {
    it('calls onClose when Escape is pressed', async () => {
      const onClose = vi.fn();
      const user = userEvent.setup();

      render(
        <Modal isOpen onClose={onClose}>
          Content
        </Modal>
      );

      await user.keyboard('{Escape}');
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('does not close when Escape is pressed and closeOnEscape is false', async () => {
      const onClose = vi.fn();
      const user = userEvent.setup();

      render(
        <Modal isOpen onClose={onClose} closeOnEscape={false}>
          Content
        </Modal>
      );

      await user.keyboard('{Escape}');
      expect(onClose).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('has dialog role', () => {
      render(<Modal {...defaultProps}>Content</Modal>);
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('has aria-modal attribute', () => {
      render(<Modal {...defaultProps}>Content</Modal>);
      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-modal', 'true');
    });

    it('connects title with aria-labelledby', () => {
      render(
        <Modal {...defaultProps} title="Modal Title">
          Content
        </Modal>
      );
      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-labelledby', 'modal-title');
      expect(screen.getByText('Modal Title')).toHaveAttribute('id', 'modal-title');
    });

    it('close button has proper aria-label', () => {
      render(<Modal {...defaultProps}>Content</Modal>);
      const closeButton = screen.getByRole('button', { name: /close modal/i });
      expect(closeButton).toHaveAttribute('aria-label', 'Close modal');
    });

    it('backdrop is hidden from screen readers', () => {
      render(<Modal {...defaultProps}>Content</Modal>);
      const backdrop = document.body.querySelector('.bg-black\\/50');
      expect(backdrop).toHaveAttribute('aria-hidden', 'true');
    });
  });

  describe('Body Scroll Lock', () => {
    it('prevents body scroll when open', () => {
      render(<Modal isOpen onClose={vi.fn()}>Content</Modal>);
      expect(document.body.style.overflow).toBe('hidden');
    });

    it('restores body scroll when closed', () => {
      const { rerender } = render(
        <Modal isOpen onClose={vi.fn()}>Content</Modal>
      );
      expect(document.body.style.overflow).toBe('hidden');

      rerender(<Modal isOpen={false} onClose={vi.fn()}>Content</Modal>);
      expect(document.body.style.overflow).toBe('');
    });
  });

  describe('Structure', () => {
    it('renders header with border', () => {
      render(
        <Modal {...defaultProps} title="Title">
          Content
        </Modal>
      );
      const header = screen.getByText('Title').parentElement;
      expect(header).toHaveClass('border-b', 'border-neutral-200');
    });

    it('renders footer with border', () => {
      render(
        <Modal {...defaultProps} footer={<div>Footer</div>}>
          Content
        </Modal>
      );
      const footer = screen.getByText('Footer').parentElement;
      expect(footer).toHaveClass('border-t', 'border-neutral-200');
    });

    it('content is scrollable', () => {
      render(<Modal {...defaultProps}>Content</Modal>);
      // The overflow-y-auto class is on the content wrapper div
      const contentWrapper = document.body.querySelector('.overflow-y-auto');
      expect(contentWrapper).toBeInTheDocument();
    });

    it('modal has max height', () => {
      render(<Modal {...defaultProps}>Content</Modal>);
      const modal = document.body.querySelector('.max-h-\\[90vh\\]');
      expect(modal).toBeInTheDocument();
    });
  });

  describe('Custom Styling', () => {
    it('applies custom className', () => {
      render(
        <Modal {...defaultProps} className="custom-class">
          Content
        </Modal>
      );
      const modal = document.body.querySelector('.custom-class');
      expect(modal).toBeInTheDocument();
    });

    it('maintains base styles with custom className', () => {
      render(
        <Modal {...defaultProps} className="custom-class">
          Content
        </Modal>
      );
      const modal = document.body.querySelector('.custom-class');
      expect(modal).toHaveClass('bg-white', 'rounded-xl', 'custom-class');
    });
  });

  describe('Portal Rendering', () => {
    it('renders in document.body', () => {
      render(<Modal {...defaultProps}>Modal content</Modal>);
      const modalInBody = document.body.querySelector('[role="dialog"]');
      expect(modalInBody).toBeInTheDocument();
    });
  });

  describe('Animation', () => {
    it('has animation classes', () => {
      render(<Modal {...defaultProps}>Content</Modal>);
      const modal = document.body.querySelector('.animate-in');
      expect(modal).toBeInTheDocument();
    });
  });
});
