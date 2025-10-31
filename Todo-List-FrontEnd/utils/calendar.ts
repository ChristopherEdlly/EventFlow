/**
 * Calendar Export Utility
 * Generates .ics files and calendar links for events
 */

import type { Event } from '../services/events';

/**
 * Format date for iCalendar format (YYYYMMDDTHHMMSSZ)
 */
function formatICalDate(dateStr: string, timeStr?: string | null): string {
  const date = new Date(dateStr);

  if (timeStr) {
    const [hours, minutes] = timeStr.split(':');
    date.setHours(parseInt(hours), parseInt(minutes), 0, 0);
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const mins = String(date.getMinutes()).padStart(2, '0');
  const secs = String(date.getSeconds()).padStart(2, '0');

  return `${year}${month}${day}T${hours}${mins}${secs}`;
}

/**
 * Escape special characters for iCalendar format
 */
function escapeICalText(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

/**
 * Generate iCalendar (.ics) file content
 */
export function generateICalContent(event: Event): string {
  const now = new Date();
  const dtStart = formatICalDate(event.date, event.time);

  // Add 1 hour to start time for end time (default)
  const endDate = new Date(event.date);
  if (event.time) {
    const [hours, minutes] = event.time.split(':');
    endDate.setHours(parseInt(hours) + 1, parseInt(minutes), 0, 0);
  } else {
    endDate.setHours(23, 59, 59, 999);
  }
  const dtEnd = formatICalDate(endDate.toISOString(), null);

  const created = formatICalDate(event.createdAt, null);
  const modified = formatICalDate(event.updatedAt, null);

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//EventFlow//Event Manager//PT',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${event.id}@eventflow.app`,
    `DTSTAMP:${formatICalDate(now.toISOString(), null)}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `CREATED:${created}`,
    `LAST-MODIFIED:${modified}`,
    `SUMMARY:${escapeICalText(event.title)}`,
  ];

  if (event.description) {
    lines.push(`DESCRIPTION:${escapeICalText(event.description)}`);
  }

  if (event.location) {
    lines.push(`LOCATION:${escapeICalText(event.location)}`);
  }

  // Add status based on event state
  const status = event.state === 'CANCELLED' ? 'CANCELLED' :
                 event.state === 'COMPLETED' ? 'CONFIRMED' :
                 'CONFIRMED';
  lines.push(`STATUS:${status}`);

  lines.push('END:VEVENT');
  lines.push('END:VCALENDAR');

  return lines.join('\r\n');
}

/**
 * Download .ics file for the event
 */
export function downloadICalFile(event: Event): void {
  const icsContent = generateICalContent(event);
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', `${event.title.replace(/\s+/g, '_')}.ics`);
  link.style.display = 'none';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

/**
 * Generate Google Calendar URL
 */
export function getGoogleCalendarUrl(event: Event): string {
  const startDate = new Date(event.date);
  if (event.time) {
    const [hours, minutes] = event.time.split(':');
    startDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
  }

  const endDate = new Date(startDate);
  endDate.setHours(endDate.getHours() + 1); // Default 1 hour duration

  const formatGoogleDate = (date: Date) => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: `${formatGoogleDate(startDate)}/${formatGoogleDate(endDate)}`,
    details: event.description || '',
    location: event.location || '',
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/**
 * Generate Outlook Calendar URL
 */
export function getOutlookCalendarUrl(event: Event): string {
  const startDate = new Date(event.date);
  if (event.time) {
    const [hours, minutes] = event.time.split(':');
    startDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
  }

  const endDate = new Date(startDate);
  endDate.setHours(endDate.getHours() + 1);

  const params = new URLSearchParams({
    path: '/calendar/action/compose',
    rru: 'addevent',
    subject: event.title,
    startdt: startDate.toISOString(),
    enddt: endDate.toISOString(),
    body: event.description || '',
    location: event.location || '',
  });

  return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`;
}

/**
 * Generate Office 365 Calendar URL
 */
export function getOffice365CalendarUrl(event: Event): string {
  return getOutlookCalendarUrl(event).replace('outlook.live.com', 'outlook.office.com');
}

/**
 * Generate Yahoo Calendar URL
 */
export function getYahooCalendarUrl(event: Event): string {
  const startDate = new Date(event.date);
  if (event.time) {
    const [hours, minutes] = event.time.split(':');
    startDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
  }

  const endDate = new Date(startDate);
  endDate.setHours(endDate.getHours() + 1);

  const formatYahooDate = (date: Date) => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0];
  };

  const params = new URLSearchParams({
    v: '60',
    title: event.title,
    st: formatYahooDate(startDate),
    et: formatYahooDate(endDate),
    desc: event.description || '',
    in_loc: event.location || '',
  });

  return `https://calendar.yahoo.com/?${params.toString()}`;
}
