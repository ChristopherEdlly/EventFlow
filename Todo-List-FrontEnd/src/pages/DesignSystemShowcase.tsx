import React from 'react';

/**
 * Design System Showcase Page
 *
 * Comprehensive demonstration of the Event Management Platform design system.
 * Shows all design tokens, color palettes, typography, spacing, and component classes.
 *
 * This page verifies that:
 * - Tailwind CSS is properly configured
 * - Design tokens are correctly imported
 * - All utilities and component classes work
 * - Inter font loads correctly
 *
 * This is a development/testing page.
 */

const DesignSystemShowcase: React.FC = () => {
  return (
    <div className="min-h-screen bg-neutral-50 py-12">
      <div className="container-custom">
        {/* Header */}
        <header className="mb-12">
          <h1 className="gradient-text mb-4 text-5xl font-bold">
            Event Management Platform
          </h1>
          <h2 className="mb-2 text-3xl font-semibold text-neutral-900">
            Design System Showcase
          </h2>
          <p className="text-lg text-neutral-600">
            Comprehensive demonstration of design tokens, typography, colors, and components
          </p>
        </header>

        {/* Color Palette - Primary */}
        <section className="card mb-8">
          <h2 className="mb-6 text-2xl font-semibold text-neutral-900">
            Primary Colors (Indigo)
          </h2>
          <p className="mb-4 text-sm text-neutral-600">
            Trust and professionalism - Used for primary buttons, links, and brand highlights
          </p>
          <div className="grid grid-cols-5 gap-4 sm:grid-cols-10">
            {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map((shade) => (
              <div key={shade} className="space-y-2">
                <div
                  className={`h-20 w-full rounded-lg bg-primary-${shade} shadow-sm`}
                  title={`primary-${shade}`}
                />
                <p className="text-center text-xs font-medium">{shade}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Color Palette - Secondary */}
        <section className="card mb-8">
          <h2 className="mb-6 text-2xl font-semibold text-neutral-900">
            Secondary Colors (Purple)
          </h2>
          <p className="mb-4 text-sm text-neutral-600">
            Creativity and energy - Used for secondary buttons and accent features
          </p>
          <div className="grid grid-cols-5 gap-4 sm:grid-cols-10">
            {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map((shade) => (
              <div key={shade} className="space-y-2">
                <div
                  className={`h-20 w-full rounded-lg bg-secondary-${shade} shadow-sm`}
                  title={`secondary-${shade}`}
                />
                <p className="text-center text-xs font-medium">{shade}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Color Palette - Neutrals */}
        <section className="card mb-8">
          <h2 className="mb-6 text-2xl font-semibold text-neutral-900">
            Neutral Colors (Warm Gray)
          </h2>
          <p className="mb-4 text-sm text-neutral-600">
            Text and structure - Used for typography, borders, and backgrounds
          </p>
          <div className="grid grid-cols-5 gap-4 sm:grid-cols-10">
            {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map((shade) => (
              <div key={shade} className="space-y-2">
                <div
                  className={`h-20 w-full rounded-lg border bg-neutral-${shade} shadow-sm`}
                  title={`neutral-${shade}`}
                />
                <p className="text-center text-xs font-medium">{shade}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Semantic Colors */}
        <section className="card mb-8">
          <h2 className="mb-6 text-2xl font-semibold text-neutral-900">
            Semantic Colors
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {/* Success */}
            <div>
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-neutral-700">
                Success (Green)
              </h3>
              <div className="space-y-2">
                {[500, 600, 700].map((shade) => (
                  <div
                    key={shade}
                    className={`flex h-12 items-center justify-center rounded-lg bg-success-${shade} text-sm font-medium text-white shadow-sm`}
                  >
                    success-{shade}
                  </div>
                ))}
              </div>
            </div>

            {/* Error */}
            <div>
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-neutral-700">
                Error (Red)
              </h3>
              <div className="space-y-2">
                {[500, 600, 700].map((shade) => (
                  <div
                    key={shade}
                    className={`flex h-12 items-center justify-center rounded-lg bg-error-${shade} text-sm font-medium text-white shadow-sm`}
                  >
                    error-{shade}
                  </div>
                ))}
              </div>
            </div>

            {/* Warning */}
            <div>
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-neutral-700">
                Warning (Amber)
              </h3>
              <div className="space-y-2">
                {[500, 600, 700].map((shade) => (
                  <div
                    key={shade}
                    className={`flex h-12 items-center justify-center rounded-lg bg-warning-${shade} text-sm font-medium text-white shadow-sm`}
                  >
                    warning-{shade}
                  </div>
                ))}
              </div>
            </div>

            {/* Info */}
            <div>
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-neutral-700">
                Info (Blue)
              </h3>
              <div className="space-y-2">
                {[500, 600, 700].map((shade) => (
                  <div
                    key={shade}
                    className={`flex h-12 items-center justify-center rounded-lg bg-info-${shade} text-sm font-medium text-white shadow-sm`}
                  >
                    info-{shade}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Typography Scale */}
        <section className="card mb-8">
          <h2 className="mb-6 text-2xl font-semibold text-neutral-900">Typography Scale</h2>
          <p className="mb-6 text-sm text-neutral-600">
            Inter font family with modular scale (1.25 ratio)
          </p>
          <div className="space-y-6">
            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-neutral-500">
                Display (6xl) - 60px
              </p>
              <h1 className="text-6xl font-bold text-neutral-900">
                The quick brown fox
              </h1>
            </div>
            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-neutral-500">
                H1 (5xl) - 48px
              </p>
              <h1 className="text-5xl font-bold text-neutral-900">
                The quick brown fox jumps over
              </h1>
            </div>
            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-neutral-500">
                H2 (4xl) - 36px
              </p>
              <h2 className="text-4xl font-bold text-neutral-900">
                The quick brown fox jumps over the lazy dog
              </h2>
            </div>
            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-neutral-500">
                H3 (3xl) - 30px
              </p>
              <h3 className="text-3xl font-semibold text-neutral-900">
                The quick brown fox jumps over the lazy dog
              </h3>
            </div>
            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-neutral-500">
                H4 (2xl) - 24px
              </p>
              <h4 className="text-2xl font-semibold text-neutral-900">
                The quick brown fox jumps over the lazy dog and beyond
              </h4>
            </div>
            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-neutral-500">
                H5 (xl) - 20px
              </p>
              <h5 className="text-xl font-semibold text-neutral-900">
                The quick brown fox jumps over the lazy dog and keeps going
              </h5>
            </div>
            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-neutral-500">
                Large (lg) - 18px
              </p>
              <p className="text-lg text-neutral-700">
                The quick brown fox jumps over the lazy dog. This is large body text for emphasis.
              </p>
            </div>
            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-neutral-500">
                Body (base) - 16px
              </p>
              <p className="text-base text-neutral-600">
                The quick brown fox jumps over the lazy dog. This is the default body text size used throughout the application.
              </p>
            </div>
            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-neutral-500">
                Small (sm) - 14px
              </p>
              <p className="text-sm text-neutral-600">
                The quick brown fox jumps over the lazy dog. This is small text for secondary information and captions.
              </p>
            </div>
            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-neutral-500">
                Extra Small (xs) - 12px
              </p>
              <p className="text-xs text-neutral-500">
                The quick brown fox jumps over the lazy dog. This is extra small text for labels and tiny captions.
              </p>
            </div>
          </div>
        </section>

        {/* Font Weights */}
        <section className="card mb-8">
          <h2 className="mb-6 text-2xl font-semibold text-neutral-900">Font Weights</h2>
          <div className="space-y-3">
            <p className="text-lg font-light text-neutral-900">Light (300) - Rarely used</p>
            <p className="text-lg font-normal text-neutral-900">Normal (400) - Body text</p>
            <p className="text-lg font-medium text-neutral-900">Medium (500) - Navigation, slight emphasis</p>
            <p className="text-lg font-semibold text-neutral-900">Semibold (600) - Headings, labels</p>
            <p className="text-lg font-bold text-neutral-900">Bold (700) - Major headings</p>
            <p className="text-lg font-extrabold text-neutral-900">Extrabold (800) - Display text</p>
          </div>
        </section>

        {/* Buttons */}
        <section className="card mb-8">
          <h2 className="mb-6 text-2xl font-semibold text-neutral-900">Button Components</h2>
          <div className="space-y-6">
            <div>
              <h3 className="mb-3 text-sm font-semibold text-neutral-700">Primary Buttons</h3>
              <div className="flex flex-wrap gap-4">
                <button className="btn-primary">Create Event</button>
                <button className="btn-primary" disabled>
                  Disabled
                </button>
              </div>
            </div>
            <div>
              <h3 className="mb-3 text-sm font-semibold text-neutral-700">Secondary Buttons</h3>
              <div className="flex flex-wrap gap-4">
                <button className="btn-secondary">Cancel</button>
                <button className="btn-secondary" disabled>
                  Disabled
                </button>
              </div>
            </div>
            <div>
              <h3 className="mb-3 text-sm font-semibold text-neutral-700">Danger Buttons</h3>
              <div className="flex flex-wrap gap-4">
                <button className="btn-danger">Delete Event</button>
                <button className="btn-danger" disabled>
                  Disabled
                </button>
              </div>
            </div>
            <div>
              <h3 className="mb-3 text-sm font-semibold text-neutral-700">Outline Buttons</h3>
              <div className="flex flex-wrap gap-4">
                <button className="btn-outline">View Details</button>
                <button className="btn-outline" disabled>
                  Disabled
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Form Elements */}
        <section className="card mb-8">
          <h2 className="mb-6 text-2xl font-semibold text-neutral-900">Form Elements</h2>
          <div className="max-w-2xl space-y-6">
            <div>
              <label htmlFor="text-input" className="mb-2 block text-sm font-medium text-neutral-700">
                Event Name
              </label>
              <input
                type="text"
                id="text-input"
                className="input"
                placeholder="Enter event name..."
              />
            </div>
            <div>
              <label htmlFor="email-input" className="mb-2 block text-sm font-medium text-neutral-700">
                Contact Email
              </label>
              <input
                type="email"
                id="email-input"
                className="input"
                placeholder="organizer@example.com"
              />
            </div>
            <div>
              <label htmlFor="select" className="mb-2 block text-sm font-medium text-neutral-700">
                Event Category
              </label>
              <select id="select" className="input">
                <option>Conference</option>
                <option>Workshop</option>
                <option>Meetup</option>
                <option>Webinar</option>
              </select>
            </div>
            <div>
              <label htmlFor="textarea" className="mb-2 block text-sm font-medium text-neutral-700">
                Event Description
              </label>
              <textarea
                id="textarea"
                className="input"
                rows={4}
                placeholder="Describe your event..."
              />
            </div>
            <div>
              <label htmlFor="disabled-input" className="mb-2 block text-sm font-medium text-neutral-700">
                Disabled Input
              </label>
              <input
                type="text"
                id="disabled-input"
                className="input"
                placeholder="This field is disabled"
                disabled
              />
            </div>
          </div>
        </section>

        {/* Badges */}
        <section className="card mb-8">
          <h2 className="mb-6 text-2xl font-semibold text-neutral-900">Badge Components</h2>
          <div className="flex flex-wrap gap-3">
            <span className="badge-primary">Primary</span>
            <span className="badge-success">Active</span>
            <span className="badge-warning">Pending</span>
            <span className="badge-danger">Cancelled</span>
          </div>
        </section>

        {/* Cards & Shadows */}
        <section className="card mb-8">
          <h2 className="mb-6 text-2xl font-semibold text-neutral-900">Cards & Shadow Elevation</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
              <h3 className="mb-2 text-lg font-semibold text-neutral-900">Shadow SM</h3>
              <p className="text-sm text-neutral-600">
                Subtle shadow for cards at rest. Low elevation level.
              </p>
            </div>
            <div className="rounded-lg border border-neutral-200 bg-white p-6 shadow">
              <h3 className="mb-2 text-lg font-semibold text-neutral-900">Shadow Default</h3>
              <p className="text-sm text-neutral-600">
                Standard elevation for most cards and containers.
              </p>
            </div>
            <div className="rounded-lg border border-neutral-200 bg-white p-6 shadow-md">
              <h3 className="mb-2 text-lg font-semibold text-neutral-900">Shadow MD</h3>
              <p className="text-sm text-neutral-600">
                Medium shadow for dropdowns and elevated elements.
              </p>
            </div>
            <div className="rounded-lg border border-neutral-200 bg-white p-6 shadow-lg">
              <h3 className="mb-2 text-lg font-semibold text-neutral-900">Shadow LG</h3>
              <p className="text-sm text-neutral-600">
                Large shadow for modals and important overlays.
              </p>
            </div>
            <div className="rounded-lg border border-neutral-200 bg-white p-6 shadow-xl">
              <h3 className="mb-2 text-lg font-semibold text-neutral-900">Shadow XL</h3>
              <p className="text-sm text-neutral-600">
                Extra large shadow for critical dialogs.
              </p>
            </div>
            <div className="rounded-lg border border-neutral-200 bg-white p-6 shadow-2xl">
              <h3 className="mb-2 text-lg font-semibold text-neutral-900">Shadow 2XL</h3>
              <p className="text-sm text-neutral-600">
                Maximum shadow for the highest elevation.
              </p>
            </div>
          </div>
        </section>

        {/* Spacing Scale */}
        <section className="card mb-8">
          <h2 className="mb-6 text-2xl font-semibold text-neutral-900">Spacing Scale (4px Grid)</h2>
          <p className="mb-6 text-sm text-neutral-600">
            All spacing follows a 4px base grid for perfect alignment
          </p>
          <div className="space-y-4">
            {[
              { size: 1, px: 4 },
              { size: 2, px: 8 },
              { size: 3, px: 12 },
              { size: 4, px: 16 },
              { size: 6, px: 24 },
              { size: 8, px: 32 },
              { size: 12, px: 48 },
              { size: 16, px: 64 },
            ].map(({ size, px }) => (
              <div key={size} className="flex items-center gap-4">
                <span className="w-20 text-sm font-medium text-neutral-700">
                  p-{size} ({px}px)
                </span>
                <div className={`bg-primary-100 p-${size}`}>
                  <div className="bg-primary-500 px-4 py-2 text-sm text-white">Content</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Border Radius */}
        <section className="card mb-8">
          <h2 className="mb-6 text-2xl font-semibold text-neutral-900">Border Radius</h2>
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            <div className="space-y-2">
              <div className="flex h-24 items-center justify-center rounded-sm bg-primary-500 text-white">
                SM (4px)
              </div>
              <p className="text-center text-xs text-neutral-600">rounded-sm</p>
            </div>
            <div className="space-y-2">
              <div className="flex h-24 items-center justify-center rounded bg-primary-500 text-white">
                Default (6px)
              </div>
              <p className="text-center text-xs text-neutral-600">rounded</p>
            </div>
            <div className="space-y-2">
              <div className="flex h-24 items-center justify-center rounded-md bg-primary-500 text-white">
                MD (8px)
              </div>
              <p className="text-center text-xs text-neutral-600">rounded-md</p>
            </div>
            <div className="space-y-2">
              <div className="flex h-24 items-center justify-center rounded-lg bg-primary-500 text-white">
                LG (12px)
              </div>
              <p className="text-center text-xs text-neutral-600">rounded-lg</p>
            </div>
            <div className="space-y-2">
              <div className="flex h-24 items-center justify-center rounded-xl bg-primary-500 text-white">
                XL (16px)
              </div>
              <p className="text-center text-xs text-neutral-600">rounded-xl</p>
            </div>
            <div className="space-y-2">
              <div className="flex h-24 items-center justify-center rounded-2xl bg-primary-500 text-white">
                2XL (24px)
              </div>
              <p className="text-center text-xs text-neutral-600">rounded-2xl</p>
            </div>
            <div className="space-y-2">
              <div className="flex h-24 items-center justify-center rounded-3xl bg-primary-500 text-white">
                3XL (32px)
              </div>
              <p className="text-center text-xs text-neutral-600">rounded-3xl</p>
            </div>
            <div className="space-y-2">
              <div className="flex h-16 w-full items-center justify-center rounded-full bg-primary-500 text-white">
                Full
              </div>
              <p className="text-center text-xs text-neutral-600">rounded-full</p>
            </div>
          </div>
        </section>

        {/* Responsive Grid */}
        <section className="card mb-8">
          <h2 className="mb-6 text-2xl font-semibold text-neutral-900">Responsive Grid</h2>
          <p className="mb-6 text-sm text-neutral-600">
            Mobile: 1 column | Tablet (md): 2 columns | Desktop (lg): 4 columns
          </p>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
              <div
                key={num}
                className="flex h-24 items-center justify-center rounded-lg bg-secondary-100 text-lg font-semibold text-secondary-800"
              >
                Item {num}
              </div>
            ))}
          </div>
        </section>

        {/* Glass Effect */}
        <section className="card mb-8">
          <h2 className="mb-6 text-2xl font-semibold text-neutral-900">Special Effects</h2>
          <div className="relative h-64 overflow-hidden rounded-xl bg-gradient-to-r from-primary-500 to-secondary-600 p-8">
            <div className="glass relative z-10 p-6">
              <h3 className="mb-2 text-xl font-semibold text-neutral-900">
                Glass Morphism Effect
              </h3>
              <p className="text-neutral-700">
                Demonstrates backdrop blur and semi-transparent background for modern UI effects.
              </p>
            </div>
          </div>
        </section>

        {/* Event Card Example */}
        <section className="card mb-8">
          <h2 className="mb-6 text-2xl font-semibold text-neutral-900">
            Example: Event Card Component
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="card shadow-md transition-shadow hover:shadow-lg">
              <div className="mb-4 flex items-start justify-between">
                <h3 className="text-xl font-semibold text-neutral-900">Tech Conference 2024</h3>
                <span className="badge-success">Active</span>
              </div>
              <p className="mb-4 text-sm text-neutral-600">
                Join us for an exciting two-day conference featuring the latest in technology and
                innovation.
              </p>
              <div className="mb-4 space-y-2 text-sm text-neutral-600">
                <p>📅 October 25-26, 2024</p>
                <p>📍 San Francisco, CA</p>
                <p>👥 500 attendees</p>
              </div>
              <button className="btn-primary w-full">View Details</button>
            </div>

            <div className="card shadow-md transition-shadow hover:shadow-lg">
              <div className="mb-4 flex items-start justify-between">
                <h3 className="text-xl font-semibold text-neutral-900">Design Workshop</h3>
                <span className="badge-warning">Pending</span>
              </div>
              <p className="mb-4 text-sm text-neutral-600">
                Interactive workshop on modern design principles and best practices for digital
                products.
              </p>
              <div className="mb-4 space-y-2 text-sm text-neutral-600">
                <p>📅 November 5, 2024</p>
                <p>📍 Online (Zoom)</p>
                <p>👥 50 attendees</p>
              </div>
              <button className="btn-primary w-full">Register Now</button>
            </div>

            <div className="card shadow-md transition-shadow hover:shadow-lg">
              <div className="mb-4 flex items-start justify-between">
                <h3 className="text-xl font-semibold text-neutral-900">Networking Meetup</h3>
                <span className="badge-danger">Cancelled</span>
              </div>
              <p className="mb-4 text-sm text-neutral-600">
                Monthly meetup for professionals to connect and share ideas over coffee.
              </p>
              <div className="mb-4 space-y-2 text-sm text-neutral-600">
                <p>📅 September 20, 2024</p>
                <p>📍 New York, NY</p>
                <p>👥 30 attendees</p>
              </div>
              <button className="btn-secondary w-full" disabled>
                Event Cancelled
              </button>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-12 rounded-lg border-t border-neutral-200 bg-white p-6 text-center">
          <p className="text-sm text-neutral-600">
            Design System built with Tailwind CSS and TypeScript
          </p>
          <p className="mt-2 text-xs text-neutral-500">
            All design tokens are centralized in design-system/tokens.ts
          </p>
        </footer>
      </div>
    </div>
  );
};

export default DesignSystemShowcase;
