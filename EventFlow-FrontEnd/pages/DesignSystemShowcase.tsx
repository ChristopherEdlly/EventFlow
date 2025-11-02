import React from 'react';

/**
 * Design System Showcase Page
 *
 * This page demonstrates that Tailwind CSS is properly configured
 * and all utilities are working correctly.
 *
 * This is a temporary testing page and will be removed in production.
 */

const DesignSystemShowcase: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container-custom">
        {/* Header */}
        <header className="mb-12">
          <h1 className="gradient-text mb-4 text-5xl font-bold">
            Design System Showcase
          </h1>
          <p className="text-lg text-gray-600">
            Testing Tailwind CSS configuration and custom utilities
          </p>
        </header>

        {/* Color Palette */}
        <section className="card mb-8">
          <h2 className="mb-6 text-2xl font-semibold text-gray-900">Color Palette</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-6">
            {['blue', 'green', 'red', 'yellow', 'purple', 'gray'].map((color) => (
              <div key={color} className="space-y-2">
                <div className={`h-20 w-full rounded-lg bg-${color}-500`} />
                <p className="text-center text-sm font-medium capitalize">{color}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Typography */}
        <section className="card mb-8">
          <h2 className="mb-6 text-2xl font-semibold text-gray-900">Typography</h2>
          <div className="space-y-4">
            <div>
              <h1 className="text-4xl font-bold">Heading 1 - 4xl Bold</h1>
            </div>
            <div>
              <h2 className="text-3xl font-semibold">Heading 2 - 3xl Semibold</h2>
            </div>
            <div>
              <h3 className="text-2xl font-medium">Heading 3 - 2xl Medium</h3>
            </div>
            <div>
              <p className="text-lg">
                Body Large - Lorem ipsum dolor sit amet, consectetur adipiscing elit.
              </p>
            </div>
            <div>
              <p className="text-base">
                Body Regular - Lorem ipsum dolor sit amet, consectetur adipiscing elit.
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">
                Body Small - Lorem ipsum dolor sit amet, consectetur adipiscing elit.
              </p>
            </div>
          </div>
        </section>

        {/* Buttons */}
        <section className="card mb-8">
          <h2 className="mb-6 text-2xl font-semibold text-gray-900">Buttons</h2>
          <div className="flex flex-wrap gap-4">
            <button className="btn-primary">Primary Button</button>
            <button className="btn-secondary">Secondary Button</button>
            <button className="btn-danger">Danger Button</button>
            <button className="btn-outline">Outline Button</button>
            <button className="btn-primary" disabled>
              Disabled Button
            </button>
          </div>
        </section>

        {/* Form Elements */}
        <section className="card mb-8">
          <h2 className="mb-6 text-2xl font-semibold text-gray-900">Form Elements</h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="text-input" className="mb-2 block text-sm font-medium text-gray-700">
                Text Input
              </label>
              <input
                type="text"
                id="text-input"
                className="input"
                placeholder="Enter some text..."
              />
            </div>
            <div>
              <label htmlFor="email-input" className="mb-2 block text-sm font-medium text-gray-700">
                Email Input
              </label>
              <input
                type="email"
                id="email-input"
                className="input"
                placeholder="your@email.com"
              />
            </div>
            <div>
              <label htmlFor="select" className="mb-2 block text-sm font-medium text-gray-700">
                Select Dropdown
              </label>
              <select id="select" className="input">
                <option>Option 1</option>
                <option>Option 2</option>
                <option>Option 3</option>
              </select>
            </div>
            <div>
              <label htmlFor="textarea" className="mb-2 block text-sm font-medium text-gray-700">
                Textarea
              </label>
              <textarea id="textarea" className="input" rows={4} placeholder="Enter text..." />
            </div>
          </div>
        </section>

        {/* Badges */}
        <section className="card mb-8">
          <h2 className="mb-6 text-2xl font-semibold text-gray-900">Badges</h2>
          <div className="flex flex-wrap gap-3">
            <span className="badge-primary">Primary Badge</span>
            <span className="badge-success">Success Badge</span>
            <span className="badge-warning">Warning Badge</span>
            <span className="badge-danger">Danger Badge</span>
          </div>
        </section>

        {/* Cards & Shadows */}
        <section className="card mb-8">
          <h2 className="mb-6 text-2xl font-semibold text-gray-900">Cards & Shadows</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <h3 className="mb-2 font-semibold">Shadow SM</h3>
              <p className="text-sm text-gray-600">Card with small shadow</p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-md">
              <h3 className="mb-2 font-semibold">Shadow MD</h3>
              <p className="text-sm text-gray-600">Card with medium shadow</p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-lg">
              <h3 className="mb-2 font-semibold">Shadow LG</h3>
              <p className="text-sm text-gray-600">Card with large shadow</p>
            </div>
          </div>
        </section>

        {/* Responsive Grid */}
        <section className="card mb-8">
          <h2 className="mb-6 text-2xl font-semibold text-gray-900">Responsive Grid</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
              <div
                key={num}
                className="flex h-24 items-center justify-center rounded-lg bg-blue-100 text-blue-800"
              >
                Grid Item {num}
              </div>
            ))}
          </div>
        </section>

        {/* Glass Effect */}
        <section className="card mb-8">
          <h2 className="mb-6 text-2xl font-semibold text-gray-900">Special Effects</h2>
          <div className="relative h-64 overflow-hidden rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 p-8">
            <div className="glass relative z-10 p-6">
              <h3 className="mb-2 text-xl font-semibold">Glass Morphism Effect</h3>
              <p className="text-gray-700">
                This demonstrates the glass morphism effect with backdrop blur
              </p>
            </div>
          </div>
        </section>

        {/* Spacing Scale */}
        <section className="card">
          <h2 className="mb-6 text-2xl font-semibold text-gray-900">Spacing Scale</h2>
          <div className="space-y-4">
            {[1, 2, 4, 8, 12, 16].map((space) => (
              <div key={space} className="flex items-center gap-4">
                <span className="w-16 text-sm font-medium">p-{space}</span>
                <div className={`bg-blue-200 p-${space}`}>
                  <div className="bg-blue-500 px-4 py-2 text-white">Content</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default DesignSystemShowcase;
