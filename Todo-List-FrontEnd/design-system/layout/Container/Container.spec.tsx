import { describe, it, expect } from 'vitest';
import { render, screen } from '@/test/utils';
import { Container } from './Container';

describe('Container', () => {
  describe('Rendering', () => {
    it('renders children', () => {
      render(<Container>Container content</Container>);
      expect(screen.getByText('Container content')).toBeInTheDocument();
    });

    it('renders as div element', () => {
      const { container } = render(<Container>Content</Container>);
      expect(container.firstChild?.nodeName).toBe('DIV');
    });

    it('has full width by default', () => {
      const { container } = render(<Container>Content</Container>);
      const element = container.firstChild as HTMLElement;
      expect(element).toHaveClass('w-full');
    });

    it('is centered by default', () => {
      const { container } = render(<Container>Content</Container>);
      const element = container.firstChild as HTMLElement;
      expect(element).toHaveClass('mx-auto');
    });

    it('has responsive padding', () => {
      const { container } = render(<Container>Content</Container>);
      const element = container.firstChild as HTMLElement;
      expect(element).toHaveClass('px-4', 'sm:px-6', 'lg:px-8');
    });
  });

  describe('Sizes', () => {
    it('renders small size', () => {
      const { container } = render(<Container size="sm">Content</Container>);
      const element = container.firstChild as HTMLElement;
      expect(element).toHaveClass('max-w-screen-sm');
    });

    it('renders medium size', () => {
      const { container } = render(<Container size="md">Content</Container>);
      const element = container.firstChild as HTMLElement;
      expect(element).toHaveClass('max-w-screen-md');
    });

    it('renders large size', () => {
      const { container } = render(<Container size="lg">Content</Container>);
      const element = container.firstChild as HTMLElement;
      expect(element).toHaveClass('max-w-screen-lg');
    });

    it('renders extra large size (default)', () => {
      const { container } = render(<Container>Content</Container>);
      const element = container.firstChild as HTMLElement;
      expect(element).toHaveClass('max-w-screen-xl');
    });

    it('renders full size', () => {
      const { container } = render(<Container size="full">Content</Container>);
      const element = container.firstChild as HTMLElement;
      expect(element).toHaveClass('max-w-full');
    });
  });

  describe('Centering', () => {
    it('centers by default', () => {
      const { container } = render(<Container>Content</Container>);
      const element = container.firstChild as HTMLElement;
      expect(element).toHaveClass('mx-auto');
    });

    it('centers when center is true', () => {
      const { container } = render(<Container center>Content</Container>);
      const element = container.firstChild as HTMLElement;
      expect(element).toHaveClass('mx-auto');
    });

    it('does not center when center is false', () => {
      const { container } = render(<Container center={false}>Content</Container>);
      const element = container.firstChild as HTMLElement;
      expect(element).not.toHaveClass('mx-auto');
    });
  });

  describe('Custom Styling', () => {
    it('applies custom className', () => {
      const { container } = render(<Container className="custom-class">Content</Container>);
      const element = container.firstChild as HTMLElement;
      expect(element).toHaveClass('custom-class');
    });

    it('maintains base styles with custom className', () => {
      const { container } = render(<Container className="custom-class">Content</Container>);
      const element = container.firstChild as HTMLElement;
      expect(element).toHaveClass('w-full', 'max-w-screen-xl', 'custom-class');
    });
  });

  describe('Responsive Behavior', () => {
    it('has responsive padding at different breakpoints', () => {
      const { container } = render(<Container>Content</Container>);
      const element = container.firstChild as HTMLElement;
      expect(element.className).toContain('px-4');
      expect(element.className).toContain('sm:px-6');
      expect(element.className).toContain('lg:px-8');
    });
  });

  describe('Layout', () => {
    it('serves as a layout wrapper', () => {
      render(
        <Container>
          <div>Child 1</div>
          <div>Child 2</div>
        </Container>
      );
      expect(screen.getByText('Child 1')).toBeInTheDocument();
      expect(screen.getByText('Child 2')).toBeInTheDocument();
    });
  });
});
