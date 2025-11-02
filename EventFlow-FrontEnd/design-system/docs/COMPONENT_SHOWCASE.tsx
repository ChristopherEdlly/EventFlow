/**
 * Component Showcase
 * Visual examples of all design system components
 *
 * This file demonstrates how to use the design system components.
 * Copy and paste these examples into your own components.
 *
 * @note This is a reference file - not meant to be imported directly
 */

import React from 'react';

// ============================================================================
// BUTTONS
// ============================================================================

export function ButtonShowcase() {
  return (
    <div className="space-y-8 p-8">
      <section>
        <h2 className="text-2xl font-semibold mb-4">Buttons</h2>

        <div className="space-y-4">
          {/* Primary Buttons */}
          <div className="flex items-center gap-4">
            <button className="btn btn-primary">Primary Button</button>
            <button className="btn btn-primary btn-sm">Small Primary</button>
            <button className="btn btn-primary btn-lg">Large Primary</button>
            <button className="btn btn-primary" disabled>Disabled</button>
          </div>

          {/* Secondary Buttons */}
          <div className="flex items-center gap-4">
            <button className="btn btn-secondary">Secondary Button</button>
            <button className="btn btn-secondary btn-sm">Small Secondary</button>
            <button className="btn btn-secondary btn-lg">Large Secondary</button>
          </div>

          {/* Danger Buttons */}
          <div className="flex items-center gap-4">
            <button className="btn btn-danger">Delete</button>
            <button className="btn btn-danger btn-sm">Remove</button>
          </div>

          {/* Ghost Buttons */}
          <div className="flex items-center gap-4">
            <button className="btn btn-ghost">Ghost Button</button>
            <button className="btn btn-ghost btn-sm">Small Ghost</button>
          </div>

          {/* Loading Button */}
          <div className="flex items-center gap-4">
            <button className="btn btn-primary" disabled>
              <span className="spinner mr-2"></span>
              Loading...
            </button>
          </div>

          {/* Icon Buttons */}
          <div className="flex items-center gap-4">
            <button className="btn btn-primary">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Event
            </button>

            <button className="btn btn-secondary" aria-label="Settings">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

// ============================================================================
// FORMS
// ============================================================================

export function FormShowcase() {
  return (
    <div className="max-w-md space-y-6 p-8">
      <h2 className="text-2xl font-semibold mb-4">Form Elements</h2>

      {/* Text Input */}
      <div>
        <label className="label" htmlFor="name">
          Event Name
        </label>
        <input
          id="name"
          type="text"
          className="input"
          placeholder="Enter event name"
        />
      </div>

      {/* Required Input */}
      <div>
        <label className="label label-required" htmlFor="email">
          Email Address
        </label>
        <input
          id="email"
          type="email"
          className="input"
          placeholder="you@example.com"
          aria-required="true"
        />
        <p className="text-xs text-neutral-500 mt-1">
          We&apos;ll never share your email
        </p>
      </div>

      {/* Input with Error */}
      <div>
        <label className="label" htmlFor="password">
          Password
        </label>
        <input
          id="password"
          type="password"
          className="input input-error"
          placeholder="Enter password"
          aria-invalid="true"
          aria-describedby="password-error"
        />
        <p id="password-error" className="text-xs text-error-600 mt-1">
          Password must be at least 8 characters
        </p>
      </div>

      {/* Textarea */}
      <div>
        <label className="label" htmlFor="description">
          Description
        </label>
        <textarea
          id="description"
          className="input min-h-[100px] resize-y"
          placeholder="Describe your event..."
        />
      </div>

      {/* Select */}
      <div>
        <label className="label" htmlFor="category">
          Category
        </label>
        <select id="category" className="input">
          <option value="">Select a category</option>
          <option value="conference">Conference</option>
          <option value="workshop">Workshop</option>
          <option value="webinar">Webinar</option>
          <option value="meetup">Meetup</option>
        </select>
      </div>

      {/* Checkbox */}
      <div className="flex items-start">
        <input
          id="terms"
          type="checkbox"
          className="mt-1 h-4 w-4 text-primary-500 border-neutral-300 rounded focus:ring-3 focus:ring-primary-100"
        />
        <label htmlFor="terms" className="ml-2 text-sm text-neutral-700">
          I agree to the terms and conditions
        </label>
      </div>

      {/* Radio Buttons */}
      <div>
        <label className="label">Ticket Type</label>
        <div className="space-y-2">
          <div className="flex items-center">
            <input
              id="free"
              type="radio"
              name="ticket"
              className="h-4 w-4 text-primary-500 border-neutral-300 focus:ring-3 focus:ring-primary-100"
            />
            <label htmlFor="free" className="ml-2 text-sm text-neutral-700">
              Free
            </label>
          </div>
          <div className="flex items-center">
            <input
              id="paid"
              type="radio"
              name="ticket"
              className="h-4 w-4 text-primary-500 border-neutral-300 focus:ring-3 focus:ring-primary-100"
            />
            <label htmlFor="paid" className="ml-2 text-sm text-neutral-700">
              Paid
            </label>
          </div>
        </div>
      </div>

      {/* Input Sizes */}
      <div className="space-y-2">
        <input className="input input-sm" placeholder="Small input" />
        <input className="input" placeholder="Default input" />
        <input className="input input-lg" placeholder="Large input" />
      </div>
    </div>
  );
}

// ============================================================================
// CARDS
// ============================================================================

export function CardShowcase() {
  return (
    <div className="space-y-6 p-8">
      <h2 className="text-2xl font-semibold mb-4">Cards</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Basic Card */}
        <div className="card">
          <h3 className="text-xl font-semibold text-neutral-900 mb-2">
            Basic Card
          </h3>
          <p className="text-neutral-600">
            This is a simple card with default styling.
          </p>
        </div>

        {/* Card with Hover */}
        <div className="card card-hover">
          <h3 className="text-xl font-semibold text-neutral-900 mb-2">
            Hoverable Card
          </h3>
          <p className="text-neutral-600">
            Hover over this card to see the shadow increase.
          </p>
        </div>

        {/* Interactive Card */}
        <a href="#" className="card card-interactive">
          <h3 className="text-xl font-semibold text-neutral-900 mb-2">
            Interactive Card
          </h3>
          <p className="text-neutral-600">
            This card is clickable with hover and focus states.
          </p>
        </a>

        {/* Card with Badge */}
        <div className="card">
          <div className="flex items-start justify-between mb-4">
            <h3 className="text-xl font-semibold text-neutral-900">
              Conference 2024
            </h3>
            <span className="badge badge-success">Active</span>
          </div>
          <p className="text-neutral-600 mb-4">
            Annual developer conference featuring the latest in web technology.
          </p>
          <div className="flex items-center justify-between">
            <span className="text-sm text-neutral-500">March 15, 2024</span>
            <button className="btn btn-secondary btn-sm">
              View Details
            </button>
          </div>
        </div>

        {/* Card with Image */}
        <div className="bg-white border border-neutral-200 rounded-lg shadow-sm overflow-hidden">
          <div className="h-48 bg-gradient-primary"></div>
          <div className="p-6">
            <h3 className="text-xl font-semibold text-neutral-900 mb-2">
              Event with Image
            </h3>
            <p className="text-neutral-600">
              Card with image header and content below.
            </p>
          </div>
        </div>

        {/* Loading Card */}
        <div className="card">
          <div className="flex items-center justify-center py-8">
            <span className="spinner w-8 h-8 text-primary-500"></span>
            <span className="ml-3 text-neutral-600">Loading...</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// BADGES
// ============================================================================

export function BadgeShowcase() {
  return (
    <div className="space-y-6 p-8">
      <h2 className="text-2xl font-semibold mb-4">Badges</h2>

      <div className="space-y-4">
        {/* Color Variants */}
        <div className="flex flex-wrap gap-2">
          <span className="badge badge-primary">Primary</span>
          <span className="badge badge-secondary">Secondary</span>
          <span className="badge badge-success">Success</span>
          <span className="badge badge-error">Error</span>
          <span className="badge badge-warning">Warning</span>
          <span className="badge badge-info">Info</span>
          <span className="badge badge-neutral">Neutral</span>
        </div>

        {/* Status Badges */}
        <div className="flex flex-wrap gap-2">
          <span className="badge badge-success">Active</span>
          <span className="badge badge-warning">Pending</span>
          <span className="badge badge-error">Cancelled</span>
          <span className="badge badge-info">Draft</span>
        </div>

        {/* Count Badges */}
        <div className="flex items-center gap-4">
          <div className="relative">
            <button className="btn btn-secondary">
              Notifications
            </button>
            <span className="absolute -top-2 -right-2 inline-flex items-center justify-center w-6 h-6 text-xs font-bold text-white bg-error-500 rounded-full">
              3
            </span>
          </div>

          <div className="relative">
            <button className="btn btn-secondary">
              Messages
            </button>
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-error-500 rounded-full border-2 border-white"></span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// ALERTS
// ============================================================================

export function AlertShowcase() {
  return (
    <div className="space-y-4 p-8 max-w-2xl">
      <h2 className="text-2xl font-semibold mb-4">Alerts</h2>

      {/* Success Alert */}
      <div className="alert alert-success" role="alert">
        <div className="flex items-start">
          <svg className="w-5 h-5 text-success-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
          </svg>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-success-900">
              Event published successfully
            </h3>
            <p className="mt-1 text-sm text-success-700">
              Your event is now live and accepting registrations.
            </p>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      <div className="alert alert-error" role="alert">
        <div className="flex items-start">
          <svg className="w-5 h-5 text-error-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
          </svg>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-error-900">
              Error processing payment
            </h3>
            <p className="mt-1 text-sm text-error-700">
              There was a problem processing your payment. Please try again.
            </p>
          </div>
        </div>
      </div>

      {/* Warning Alert */}
      <div className="alert alert-warning" role="alert">
        <div className="flex items-start">
          <svg className="w-5 h-5 text-warning-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
          </svg>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-warning-900">
              Event capacity almost reached
            </h3>
            <p className="mt-1 text-sm text-warning-700">
              Only 10 spots remaining for this event.
            </p>
          </div>
        </div>
      </div>

      {/* Info Alert */}
      <div className="alert alert-info" role="alert">
        <div className="flex items-start">
          <svg className="w-5 h-5 text-info-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
          </svg>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-info-900">
              New feature available
            </h3>
            <p className="mt-1 text-sm text-info-700">
              You can now export attendee lists to CSV format.
            </p>
          </div>
        </div>
      </div>

      {/* Alert with Actions */}
      <div className="alert alert-info" role="alert">
        <div className="flex items-start justify-between">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-info-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
            </svg>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-info-900">
                Update available
              </h3>
              <p className="mt-1 text-sm text-info-700">
                A new version is available. Update now to get the latest features.
              </p>
            </div>
          </div>
          <button className="ml-4 text-sm font-medium text-info-700 hover:text-info-800">
            Update
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// MODALS
// ============================================================================

export function ModalShowcase() {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div className="p-8">
      <h2 className="text-2xl font-semibold mb-4">Modals</h2>

      <button className="btn btn-primary" onClick={() => setIsOpen(true)}>
        Open Modal
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-modal">
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
            onClick={() => setIsOpen(false)}
          />

          {/* Modal */}
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full">
              <div className="flex items-start justify-between mb-4">
                <h2 className="text-2xl font-semibold text-neutral-900">
                  Confirm Deletion
                </h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-neutral-400 hover:text-neutral-600"
                  aria-label="Close"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <p className="text-neutral-600 mb-6">
                Are you sure you want to delete this event? This action cannot be undone and all attendee data will be permanently removed.
              </p>

              <div className="flex gap-3 justify-end">
                <button
                  className="btn btn-secondary"
                  onClick={() => setIsOpen(false)}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-danger"
                  onClick={() => {
                    // Handle delete
                    setIsOpen(false);
                  }}
                >
                  Delete Event
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// TABLES
// ============================================================================

export function TableShowcase() {
  const attendees = [
    { id: 1, name: 'John Doe', email: 'john@example.com', status: 'Confirmed', date: 'Mar 10, 2024' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', status: 'Pending', date: 'Mar 11, 2024' },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com', status: 'Confirmed', date: 'Mar 12, 2024' },
  ];

  return (
    <div className="p-8">
      <h2 className="text-2xl font-semibold mb-4">Tables</h2>

      <div className="card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-50 border-b-2 border-neutral-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Registration Date
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-neutral-200">
              {attendees.map((attendee) => (
                <tr key={attendee.id} className="hover:bg-neutral-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-neutral-900">
                      {attendee.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-neutral-600">
                      {attendee.email}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`badge ${attendee.status === 'Confirmed' ? 'badge-success' : 'badge-warning'}`}>
                      {attendee.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600">
                    {attendee.date}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button className="text-primary-500 hover:text-primary-700 mr-4">
                      Edit
                    </button>
                    <button className="text-error-500 hover:text-error-700">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// COMPLETE PAGE EXAMPLE
// ============================================================================

export function CompletePageExample() {
  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200 sticky top-0 z-sticky">
        <div className="container-custom">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-neutral-900">
                Event Platform
              </h1>
            </div>
            <nav className="flex items-center gap-4">
              <a href="#" className="text-neutral-600 hover:text-neutral-900">
                Events
              </a>
              <a href="#" className="text-neutral-600 hover:text-neutral-900">
                Calendar
              </a>
              <button className="btn btn-primary btn-sm">
                Create Event
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container-custom py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-neutral-900 mb-2">
            My Events
          </h1>
          <p className="text-lg text-neutral-600">
            Manage and track all your events in one place
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-500 mb-1">Total Events</p>
                <p className="text-3xl font-bold text-neutral-900">24</p>
              </div>
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-500 mb-1">Active</p>
                <p className="text-3xl font-bold text-success-600">18</p>
              </div>
              <div className="w-12 h-12 bg-success-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-success-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-500 mb-1">Attendees</p>
                <p className="text-3xl font-bold text-neutral-900">1,429</p>
              </div>
              <div className="w-12 h-12 bg-secondary-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-secondary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Event Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="card card-hover">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-xl font-semibold text-neutral-900">
                  Tech Conference {i}
                </h3>
                <span className="badge badge-success">Active</span>
              </div>

              <p className="text-neutral-600 mb-4 truncate-2-lines">
                Join us for an amazing conference featuring the latest in technology
                and innovation. Network with industry leaders and learn from experts.
              </p>

              <div className="flex items-center justify-between text-sm text-neutral-500 mb-4">
                <span>March {10 + i}, 2024</span>
                <span>245 attendees</span>
              </div>

              <button className="btn btn-secondary w-full">
                View Details
              </button>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
