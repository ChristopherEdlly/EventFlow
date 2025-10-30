/**
 * Component Library Showcase
 * Demonstrates all design system components
 */

import React, { useState } from 'react';
import {
  Alert,
  Badge,
  Button,
  Card,
  Input,
  Textarea,
  Modal,
  Spinner,
} from '../../design-system/components';
import {
  Container,
  Grid,
  Stack,
} from '../../design-system/layout';
import {
  Plus,
  Mail,
  Lock,
  Search,
  Calendar,
  MapPin,
  Users,
} from 'lucide-react';

const ComponentShowcase: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showAlert, setShowAlert] = useState(true);

  return (
    <div className="min-h-screen bg-neutral-50 py-12">
      <Container size="xl">
        {/* Header */}
        <Stack spacing="lg" className="mb-12">
          <div>
            <h1 className="text-5xl font-bold text-neutral-900 mb-2">
              Component Library
            </h1>
            <p className="text-lg text-neutral-600">
              Complete design system for the Event Management Platform
            </p>
          </div>

          {showAlert && (
            <Alert
              variant="success"
              title="Component Library Ready!"
              onClose={() => setShowAlert(false)}
            >
              All 10 components are built, tested, and ready to use.
            </Alert>
          )}
        </Stack>

        {/* Buttons */}
        <Card className="mb-8">
          <Stack spacing="md">
            <h2 className="text-2xl font-semibold text-neutral-900">Buttons</h2>

            <div>
              <h3 className="text-sm font-medium text-neutral-700 mb-3">Variants</h3>
              <Stack direction="horizontal" spacing="sm" wrap>
                <Button variant="primary">Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="danger">Danger</Button>
              </Stack>
            </div>

            <div>
              <h3 className="text-sm font-medium text-neutral-700 mb-3">Sizes</h3>
              <Stack direction="horizontal" spacing="sm" align="center">
                <Button size="sm">Small</Button>
                <Button size="md">Medium</Button>
                <Button size="lg">Large</Button>
              </Stack>
            </div>

            <div>
              <h3 className="text-sm font-medium text-neutral-700 mb-3">States</h3>
              <Stack direction="horizontal" spacing="sm" wrap>
                <Button disabled>Disabled</Button>
                <Button loading>Loading...</Button>
                <Button leftIcon={<Plus className="w-5 h-5" />}>With Icon</Button>
                <Button fullWidth>Full Width</Button>
              </Stack>
            </div>
          </Stack>
        </Card>

        {/* Badges */}
        <Card className="mb-8">
          <Stack spacing="md">
            <h2 className="text-2xl font-semibold text-neutral-900">Badges</h2>

            <div>
              <h3 className="text-sm font-medium text-neutral-700 mb-3">Variants</h3>
              <Stack direction="horizontal" spacing="sm" wrap>
                <Badge variant="primary">Primary</Badge>
                <Badge variant="secondary">Secondary</Badge>
                <Badge variant="success">Success</Badge>
                <Badge variant="warning">Warning</Badge>
                <Badge variant="danger">Danger</Badge>
                <Badge variant="info">Info</Badge>
                <Badge variant="neutral">Neutral</Badge>
              </Stack>
            </div>

            <div>
              <h3 className="text-sm font-medium text-neutral-700 mb-3">With Dot</h3>
              <Stack direction="horizontal" spacing="sm" wrap>
                <Badge variant="success" dot>Active</Badge>
                <Badge variant="warning" dot>Pending</Badge>
                <Badge variant="danger" dot>Cancelled</Badge>
              </Stack>
            </div>

            <div>
              <h3 className="text-sm font-medium text-neutral-700 mb-3">Sizes</h3>
              <Stack direction="horizontal" spacing="sm" align="center" wrap>
                <Badge size="sm">Small</Badge>
                <Badge size="md">Medium</Badge>
                <Badge size="lg">Large</Badge>
              </Stack>
            </div>
          </Stack>
        </Card>

        {/* Alerts */}
        <Card className="mb-8">
          <Stack spacing="md">
            <h2 className="text-2xl font-semibold text-neutral-900">Alerts</h2>

            <Alert variant="success" title="Success">
              Your event has been created successfully!
            </Alert>

            <Alert variant="error" title="Error">
              Failed to save event. Please try again.
            </Alert>

            <Alert variant="warning" title="Warning">
              This event is scheduled for a holiday.
            </Alert>

            <Alert variant="info" title="Information">
              Registration opens in 3 days.
            </Alert>

            <Alert variant="info" onClose={() => console.log('Dismissed')}>
              This alert can be dismissed.
            </Alert>
          </Stack>
        </Card>

        {/* Inputs */}
        <Card className="mb-8">
          <Stack spacing="md">
            <h2 className="text-2xl font-semibold text-neutral-900">Form Inputs</h2>

            <Grid cols={{ default: 1, md: 2 }} gap="md">
              <Input
                label="Email"
                type="email"
                placeholder="you@example.com"
                leftIcon={<Mail className="w-5 h-5" />}
              />

              <Input
                label="Password"
                type="password"
                placeholder="Enter password"
                leftIcon={<Lock className="w-5 h-5" />}
                required
              />

              <Input
                label="Search"
                type="search"
                placeholder="Search events..."
                leftIcon={<Search className="w-5 h-5" />}
              />

              <Input
                label="Date"
                type="date"
                leftIcon={<Calendar className="w-5 h-5" />}
              />
            </Grid>

            <Input
              label="Event Title"
              placeholder="Enter event title"
              helperText="Choose a clear, descriptive title"
              required
            />

            <Input
              label="With Error"
              error="This field is required"
              placeholder="Invalid input"
            />

            <Textarea
              label="Description"
              placeholder="Enter event description"
              rows={4}
              helperText="Minimum 50 characters"
            />
          </Stack>
        </Card>

        {/* Cards */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-neutral-900 mb-4">Cards</h2>
          <Grid cols={{ default: 1, md: 2, lg: 3 }} gap="lg">
            <Card variant="default">
              <Stack spacing="sm">
                <h3 className="text-lg font-semibold">Default Card</h3>
                <p className="text-neutral-600">Standard content container.</p>
              </Stack>
            </Card>

            <Card
              variant="interactive"
              onClick={() => console.log('Card clicked')}
            >
              <Stack spacing="sm">
                <h3 className="text-lg font-semibold">Interactive Card</h3>
                <p className="text-neutral-600">Click me!</p>
              </Stack>
            </Card>

            <Card
              variant="default"
              header={<h3 className="font-semibold">With Header</h3>}
              footer={
                <div className="flex justify-end gap-2">
                  <Button size="sm" variant="outline">Cancel</Button>
                  <Button size="sm">Save</Button>
                </div>
              }
            >
              <p className="text-neutral-600">Card with header and footer sections.</p>
            </Card>
          </Grid>
        </div>

        {/* Modal */}
        <Card className="mb-8">
          <Stack spacing="md">
            <h2 className="text-2xl font-semibold text-neutral-900">Modal</h2>
            <Button onClick={() => setIsModalOpen(true)}>
              Open Modal
            </Button>
          </Stack>
        </Card>

        {/* Spinner */}
        <Card className="mb-8">
          <Stack spacing="md">
            <h2 className="text-2xl font-semibold text-neutral-900">Spinner</h2>

            <div>
              <h3 className="text-sm font-medium text-neutral-700 mb-3">Sizes</h3>
              <Stack direction="horizontal" spacing="lg" align="center">
                <Spinner size="xs" />
                <Spinner size="sm" />
                <Spinner size="md" />
                <Spinner size="lg" />
                <Spinner size="xl" />
              </Stack>
            </div>

            <div>
              <h3 className="text-sm font-medium text-neutral-700 mb-3">Colors</h3>
              <Stack direction="horizontal" spacing="lg" align="center">
                <Spinner color="primary" />
                <Spinner color="secondary" />
                <div className="bg-neutral-800 p-4 rounded">
                  <Spinner color="white" />
                </div>
              </Stack>
            </div>
          </Stack>
        </Card>

        {/* Layout Components */}
        <Card className="mb-8">
          <Stack spacing="md">
            <h2 className="text-2xl font-semibold text-neutral-900">Layout Components</h2>

            <div>
              <h3 className="text-sm font-medium text-neutral-700 mb-3">Stack</h3>
              <Stack spacing="sm">
                <div className="bg-primary-100 p-3 rounded">Item 1</div>
                <div className="bg-primary-100 p-3 rounded">Item 2</div>
                <div className="bg-primary-100 p-3 rounded">Item 3</div>
              </Stack>
            </div>

            <div>
              <h3 className="text-sm font-medium text-neutral-700 mb-3">Grid</h3>
              <Grid cols={{ default: 2, md: 4 }} gap="md">
                <div className="bg-secondary-100 p-4 rounded text-center">1</div>
                <div className="bg-secondary-100 p-4 rounded text-center">2</div>
                <div className="bg-secondary-100 p-4 rounded text-center">3</div>
                <div className="bg-secondary-100 p-4 rounded text-center">4</div>
              </Grid>
            </div>
          </Stack>
        </Card>

        {/* Example: Event Card */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-neutral-900 mb-4">
            Example: Event Card
          </h2>
          <Grid cols={{ default: 1, md: 2, lg: 3 }} gap="lg">
            <Card
              variant="interactive"
              header={
                <Stack direction="horizontal" justify="between" align="center">
                  <h3 className="text-lg font-semibold">Summer Music Festival</h3>
                  <Badge variant="success" dot>Active</Badge>
                </Stack>
              }
              footer={
                <Stack direction="horizontal" justify="between" className="text-sm text-neutral-600">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    Jun 15, 2024
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    245 attendees
                  </span>
                </Stack>
              }
            >
              <Stack spacing="sm">
                <p className="text-neutral-700">
                  Join us for an unforgettable day of live music, food, and fun!
                </p>
                <div className="flex items-center gap-1 text-sm text-neutral-600">
                  <MapPin className="w-4 h-4" />
                  Central Park, NYC
                </div>
                <Stack direction="horizontal" spacing="xs">
                  <Badge size="sm" variant="primary">Music</Badge>
                  <Badge size="sm" variant="secondary">Outdoor</Badge>
                  <Badge size="sm" variant="info">Family</Badge>
                </Stack>
              </Stack>
            </Card>
          </Grid>
        </div>
      </Container>

      {/* Modal Example */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create New Event"
        footer={
          <Stack direction="horizontal" justify="end" spacing="sm">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setIsModalOpen(false)}>
              Create Event
            </Button>
          </Stack>
        }
      >
        <Stack spacing="md">
          <Input label="Event Title" placeholder="Enter event title" required />
          <Textarea label="Description" placeholder="Enter description" rows={4} />
          <Grid cols={{ default: 1, md: 2 }} gap="md">
            <Input label="Date" type="date" />
            <Input label="Time" type="time" />
          </Grid>
          <Input label="Location" placeholder="Event location" />
        </Stack>
      </Modal>
    </div>
  );
};

export default ComponentShowcase;
