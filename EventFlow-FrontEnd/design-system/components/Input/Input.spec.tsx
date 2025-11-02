import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@/test/utils';
import userEvent from '@testing-library/user-event';
import { Input, Textarea } from './Input';

describe('Input', () => {
  describe('Rendering', () => {
    it('renders with label', () => {
      render(<Input label="Email" />);
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    });

    it('renders without label', () => {
      render(<Input placeholder="Enter text" />);
      expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
    });

    it('renders with placeholder', () => {
      render(<Input label="Name" placeholder="John Doe" />);
      expect(screen.getByPlaceholderText('John Doe')).toBeInTheDocument();
    });

    it('renders with default type text', () => {
      render(<Input label="Name" />);
      expect(screen.getByLabelText(/name/i)).toHaveAttribute('type', 'text');
    });

    it('renders with email type', () => {
      render(<Input label="Email" type="email" />);
      expect(screen.getByLabelText(/email/i)).toHaveAttribute('type', 'email');
    });

    it('renders with password type', () => {
      render(<Input label="Password" type="password" />);
      expect(screen.getByLabelText(/password/i)).toHaveAttribute('type', 'password');
    });
  });

  describe('States', () => {
    it('shows error state', () => {
      render(<Input label="Email" error="Invalid email" />);
      expect(screen.getByText(/invalid email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email/i)).toHaveClass('border-error-500');
    });

    it('shows error with role alert', () => {
      render(<Input label="Email" error="Invalid email" />);
      const error = screen.getByRole('alert');
      expect(error).toHaveTextContent('Invalid email');
    });

    it('displays helper text', () => {
      render(<Input label="Password" helperText="Minimum 6 characters" />);
      expect(screen.getByText(/minimum 6 characters/i)).toBeInTheDocument();
    });

    it('hides helper text when error is present', () => {
      render(
        <Input
          label="Email"
          helperText="Enter your email"
          error="Invalid email"
        />
      );
      expect(screen.queryByText(/enter your email/i)).not.toBeInTheDocument();
      expect(screen.getByText(/invalid email/i)).toBeInTheDocument();
    });

    it('is disabled when disabled prop is true', () => {
      render(<Input label="Name" disabled />);
      expect(screen.getByLabelText(/name/i)).toBeDisabled();
    });

    it('shows required indicator', () => {
      render(<Input label="Email" required />);
      expect(screen.getByLabelText('required')).toBeInTheDocument();
    });
  });

  describe('Interaction', () => {
    it('handles value changes', async () => {
      const handleChange = vi.fn();
      const user = userEvent.setup();

      render(<Input label="Name" onChange={handleChange} />);
      const input = screen.getByLabelText(/name/i);

      await user.type(input, 'John Doe');
      expect(handleChange).toHaveBeenCalled();
    });

    it('accepts initial value', () => {
      render(<Input label="Name" value="John" onChange={() => {}} />);
      expect(screen.getByLabelText(/name/i)).toHaveValue('John');
    });

    it('updates value when typing', async () => {
      const user = userEvent.setup();
      render(<Input label="Name" />);
      const input = screen.getByLabelText(/name/i);

      await user.type(input, 'Test');
      expect(input).toHaveValue('Test');
    });
  });

  describe('Icons', () => {
    it('renders with left icon', () => {
      render(
        <Input
          label="Email"
          leftIcon={<span data-testid="left-icon">@</span>}
        />
      );
      expect(screen.getByTestId('left-icon')).toBeInTheDocument();
    });

    it('renders with right icon', () => {
      render(
        <Input
          label="Password"
          rightIcon={<span data-testid="right-icon">👁</span>}
        />
      );
      expect(screen.getByTestId('right-icon')).toBeInTheDocument();
    });

    it('applies proper padding when left icon exists', () => {
      render(
        <Input
          label="Email"
          leftIcon={<span>@</span>}
        />
      );
      expect(screen.getByLabelText(/email/i)).toHaveClass('pl-11');
    });

    it('applies proper padding when right icon exists', () => {
      render(
        <Input
          label="Password"
          rightIcon={<span>👁</span>}
        />
      );
      expect(screen.getByLabelText(/password/i)).toHaveClass('pr-11');
    });
  });

  describe('Accessibility', () => {
    it('links label to input via htmlFor', () => {
      render(<Input label="Email" />);
      const input = screen.getByLabelText(/email/i);
      expect(input).toBeInTheDocument();
    });

    it('sets aria-invalid when error exists', () => {
      render(<Input label="Email" error="Invalid" />);
      expect(screen.getByLabelText(/email/i)).toHaveAttribute('aria-invalid', 'true');
    });

    it('sets aria-invalid to false when no error', () => {
      render(<Input label="Email" />);
      expect(screen.getByLabelText(/email/i)).toHaveAttribute('aria-invalid', 'false');
    });

    it('connects error message via aria-describedby', () => {
      render(<Input label="Email" error="Invalid email" />);
      const input = screen.getByLabelText(/email/i);
      const errorId = input.getAttribute('aria-describedby');
      expect(errorId).toBeTruthy();
      expect(screen.getByRole('alert')).toHaveAttribute('id', errorId);
    });

    it('connects helper text via aria-describedby', () => {
      render(<Input label="Email" helperText="Enter your email" />);
      const input = screen.getByLabelText(/email/i);
      const helperId = input.getAttribute('aria-describedby');
      expect(helperId).toBeTruthy();
    });

    it('supports ref forwarding', () => {
      const ref = vi.fn();
      render(<Input label="Name" ref={ref} />);
      expect(ref).toHaveBeenCalled();
    });

    it('uses provided id', () => {
      render(<Input label="Email" id="custom-id" />);
      expect(screen.getByLabelText(/email/i)).toHaveAttribute('id', 'custom-id');
    });
  });

  describe('Custom Styling', () => {
    it('applies custom className to wrapper', () => {
      render(<Input label="Name" className="custom-wrapper" />);
      const wrapper = screen.getByLabelText(/name/i).parentElement?.parentElement;
      expect(wrapper).toHaveClass('custom-wrapper');
    });

    it('applies custom inputClassName to input', () => {
      render(<Input label="Name" inputClassName="custom-input" />);
      expect(screen.getByLabelText(/name/i)).toHaveClass('custom-input');
    });
  });
});

describe('Textarea', () => {
  describe('Rendering', () => {
    it('renders with label', () => {
      render(<Textarea label="Description" />);
      expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    });

    it('renders as textarea element', () => {
      render(<Textarea label="Message" />);
      expect(screen.getByLabelText(/message/i).tagName).toBe('TEXTAREA');
    });

    it('renders with default rows', () => {
      render(<Textarea label="Message" />);
      expect(screen.getByLabelText(/message/i)).toHaveAttribute('rows', '4');
    });

    it('renders with custom rows', () => {
      render(<Textarea label="Message" rows={10} />);
      expect(screen.getByLabelText(/message/i)).toHaveAttribute('rows', '10');
    });
  });

  describe('States', () => {
    it('shows error state', () => {
      render(<Textarea label="Message" error="Required field" />);
      expect(screen.getByText(/required field/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/message/i)).toHaveClass('border-error-500');
    });

    it('displays helper text', () => {
      render(<Textarea label="Message" helperText="Max 500 characters" />);
      expect(screen.getByText(/max 500 characters/i)).toBeInTheDocument();
    });

    it('is disabled when disabled prop is true', () => {
      render(<Textarea label="Message" disabled />);
      expect(screen.getByLabelText(/message/i)).toBeDisabled();
    });

    it('shows required indicator', () => {
      render(<Textarea label="Message" required />);
      expect(screen.getByLabelText('required')).toBeInTheDocument();
    });
  });

  describe('Resize', () => {
    it('applies vertical resize by default', () => {
      render(<Textarea label="Message" />);
      expect(screen.getByLabelText(/message/i)).toHaveClass('resize-y');
    });

    it('applies no resize', () => {
      render(<Textarea label="Message" resize="none" />);
      expect(screen.getByLabelText(/message/i)).toHaveClass('resize-none');
    });

    it('applies horizontal resize', () => {
      render(<Textarea label="Message" resize="horizontal" />);
      expect(screen.getByLabelText(/message/i)).toHaveClass('resize-x');
    });

    it('applies both resize', () => {
      render(<Textarea label="Message" resize="both" />);
      expect(screen.getByLabelText(/message/i)).toHaveClass('resize');
    });
  });

  describe('Interaction', () => {
    it('handles value changes', async () => {
      const handleChange = vi.fn();
      const user = userEvent.setup();

      render(<Textarea label="Message" onChange={handleChange} />);
      const textarea = screen.getByLabelText(/message/i);

      await user.type(textarea, 'Test message');
      expect(handleChange).toHaveBeenCalled();
    });

    it('accepts initial value', () => {
      render(<Textarea label="Message" value="Initial" onChange={() => {}} />);
      expect(screen.getByLabelText(/message/i)).toHaveValue('Initial');
    });
  });

  describe('Accessibility', () => {
    it('links label to textarea via htmlFor', () => {
      render(<Textarea label="Message" />);
      const textarea = screen.getByLabelText(/message/i);
      expect(textarea).toBeInTheDocument();
    });

    it('sets aria-invalid when error exists', () => {
      render(<Textarea label="Message" error="Required" />);
      expect(screen.getByLabelText(/message/i)).toHaveAttribute('aria-invalid', 'true');
    });

    it('supports ref forwarding', () => {
      const ref = vi.fn();
      render(<Textarea label="Message" ref={ref} />);
      expect(ref).toHaveBeenCalled();
    });
  });
});
