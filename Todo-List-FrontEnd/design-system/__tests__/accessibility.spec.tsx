import { describe, it } from 'vitest';
import React from 'react';
import { checkA11y } from '@/test/a11y';

// Component imports
import { Button } from '../components/Button';
import { Input, Textarea } from '../components/Input';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';
import { Alert } from '../components/Alert';
import { Modal } from '../components/Modal';
import { Spinner } from '../components/Spinner';
import { Container } from '../layout/Container';
import { Stack } from '../layout/Stack';
import { Grid } from '../layout/Grid';

describe('Accessibility Tests', () => {
  describe('Button Component', () => {
    it('has no accessibility violations with default props', async () => {
      await checkA11y(<Button>Click me</Button>);
    });

    it('has no violations when disabled', async () => {
      await checkA11y(<Button disabled>Disabled Button</Button>);
    });

    it('has no violations when loading', async () => {
      await checkA11y(<Button loading>Loading</Button>);
    });

    it('has no violations with icons', async () => {
      await checkA11y(
        <Button leftIcon={<span>←</span>} rightIcon={<span>→</span>}>
          With Icons
        </Button>
      );
    });
  });

  describe('Input Component', () => {
    it('has no accessibility violations with label', async () => {
      await checkA11y(<Input label="Email Address" />);
    });

    it('has no violations with error state', async () => {
      await checkA11y(<Input label="Email" error="Invalid email address" />);
    });

    it('has no violations with helper text', async () => {
      await checkA11y(<Input label="Password" helperText="Minimum 6 characters" />);
    });

    it('has no violations when required', async () => {
      await checkA11y(<Input label="Name" required />);
    });

    it('has no violations when disabled', async () => {
      await checkA11y(<Input label="Name" disabled />);
    });
  });

  describe('Textarea Component', () => {
    it('has no accessibility violations', async () => {
      await checkA11y(<Textarea label="Description" />);
    });

    it('has no violations with error', async () => {
      await checkA11y(<Textarea label="Message" error="Required field" />);
    });

    it('has no violations when required', async () => {
      await checkA11y(<Textarea label="Comments" required />);
    });
  });

  describe('Card Component', () => {
    it('has no accessibility violations', async () => {
      await checkA11y(<Card>Card content</Card>);
    });

    it('has no violations with header and footer', async () => {
      await checkA11y(
        <Card header={<h3>Card Title</h3>} footer={<div>Footer</div>}>
          Card content
        </Card>
      );
    });

    it('has no violations when interactive', async () => {
      await checkA11y(
        <Card variant="interactive" onClick={() => {}}>
          Clickable card
        </Card>
      );
    });
  });

  describe('Badge Component', () => {
    it('has no accessibility violations', async () => {
      await checkA11y(<Badge>New</Badge>);
    });

    it('has no violations with dot indicator', async () => {
      await checkA11y(<Badge dot>Active</Badge>);
    });

    it('has no violations with different variants', async () => {
      await checkA11y(<Badge variant="success">Approved</Badge>);
    });
  });

  describe('Alert Component', () => {
    it('has no accessibility violations', async () => {
      await checkA11y(<Alert>Information message</Alert>);
    });

    it('has no violations with title', async () => {
      await checkA11y(
        <Alert title="Success!" variant="success">
          Your changes have been saved
        </Alert>
      );
    });

    it('has no violations when dismissible', async () => {
      await checkA11y(
        <Alert variant="warning" onClose={() => {}}>
          Warning message
        </Alert>
      );
    });

    it('has no violations with error variant', async () => {
      await checkA11y(
        <Alert variant="error" title="Error">
          Something went wrong
        </Alert>
      );
    });
  });

  describe('Spinner Component', () => {
    it('has no accessibility violations', async () => {
      await checkA11y(<Spinner />);
    });

    it('has no violations with custom label', async () => {
      await checkA11y(<Spinner label="Loading data" />);
    });

    it('has no violations with different sizes', async () => {
      await checkA11y(<Spinner size="lg" />);
    });
  });

  describe('Container Component', () => {
    it('has no accessibility violations', async () => {
      await checkA11y(
        <Container>
          <h1>Page Title</h1>
          <p>Page content</p>
        </Container>
      );
    });

    it('has no violations with different sizes', async () => {
      await checkA11y(
        <Container size="sm">
          <p>Narrow container</p>
        </Container>
      );
    });
  });

  describe('Stack Component', () => {
    it('has no accessibility violations', async () => {
      await checkA11y(
        <Stack>
          <div>Item 1</div>
          <div>Item 2</div>
        </Stack>
      );
    });

    it('has no violations with horizontal direction', async () => {
      await checkA11y(
        <Stack direction="horizontal">
          <button>Button 1</button>
          <button>Button 2</button>
        </Stack>
      );
    });
  });

  describe('Grid Component', () => {
    it('has no accessibility violations', async () => {
      await checkA11y(
        <Grid cols={2}>
          <div>Item 1</div>
          <div>Item 2</div>
        </Grid>
      );
    });

    it('has no violations with responsive columns', async () => {
      await checkA11y(
        <Grid cols={{ default: 1, md: 2, lg: 3 }}>
          <Card>Card 1</Card>
          <Card>Card 2</Card>
          <Card>Card 3</Card>
        </Grid>
      );
    });
  });

  describe('Component Combinations', () => {
    it('has no violations with form components', async () => {
      await checkA11y(
        <Stack spacing="md">
          <Input label="Name" required />
          <Input label="Email" type="email" required />
          <Textarea label="Message" />
          <Button type="submit">Submit</Button>
        </Stack>
      );
    });

    it('has no violations with card and badges', async () => {
      await checkA11y(
        <Card header={<h3>Event Details</h3>}>
          <Stack spacing="sm">
            <p>Event information</p>
            <Stack direction="horizontal" spacing="xs">
              <Badge variant="success">Active</Badge>
              <Badge variant="info">Public</Badge>
            </Stack>
          </Stack>
        </Card>
      );
    });

    it('has no violations with grid layout', async () => {
      await checkA11y(
        <Container>
          <Grid cols={{ default: 1, md: 2 }} gap="lg">
            <Card>
              <h3>Card 1</h3>
              <p>Content 1</p>
            </Card>
            <Card>
              <h3>Card 2</h3>
              <p>Content 2</p>
            </Card>
          </Grid>
        </Container>
      );
    });
  });
});
