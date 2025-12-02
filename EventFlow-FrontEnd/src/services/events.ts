/**
 * Events Service
 * API calls for event management
 */

import { api } from './api';

export type EventVisibility = 'PUBLIC' | 'PRIVATE';
export type EventCategory =
  | 'CONFERENCIA'
  | 'WORKSHOP'
  | 'PALESTRA'
  | 'FESTA'
  | 'ESPORTIVO'
  | 'CULTURAL'
  | 'EDUCACIONAL'
  | 'NETWORKING'
  | 'CORPORATIVO'
  | 'BENEFICENTE'
  | 'OUTRO';

export type EventType = 'PRESENCIAL' | 'ONLINE' | 'HIBRIDO';

// Estados removidos do sistema
export type GuestStatus = 'YES' | 'NO' | 'MAYBE' | 'WAITLISTED' | 'PENDING';

export interface Event {
  id: string;
  title: string;
  description: string | null;
  date: string;
  time: string | null;
  endDate?: string | null;
  endTime?: string | null;
  location: string | null;
  visibility: EventVisibility;
  availability: 'PUBLISHED' | 'COMPLETED' | 'CANCELLED';
  capacity: number | null;
  waitlistEnabled: boolean;
  showGuestList: boolean;
  timezone: string | null;
  // Novos campos
  category: EventCategory;
  eventType: EventType;
  price: number;
  minAge: number | null;
  imageUrl: string | null;
  onlineUrl: string | null;
  tags: string | null;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    guests: number;
  };
}

export interface Guest {
  id: string;
  name: string;
  email: string;
  status: GuestStatus;
  eventId: string;
  userId: string | null;
  respondedAt: string | null;
  declineReason?: string | null;
  createdAt: string;
}

export interface CreateEventDto {
  title: string;
  description?: string;
  date: string;
  time?: string;
  endDate?: string;
  endTime?: string;
  location?: string;
  visibility?: EventVisibility;
  availability?: 'PUBLISHED' | 'COMPLETED' | 'CANCELLED';
  capacity?: number;
  waitlistEnabled?: boolean;
  showGuestList?: boolean;
  timezone?: string;
  // Novos campos
  category?: EventCategory;
  eventType?: EventType;
  price?: number;
  minAge?: number;
  imageUrl?: string;
  onlineUrl?: string;
  tags?: string;
}

export interface UpdateEventDto {
  title?: string;
  description?: string;
  date?: string;
  time?: string;
  endDate?: string;
  endTime?: string;
  location?: string;
  visibility?: EventVisibility;
  availability?: 'PUBLISHED' | 'COMPLETED' | 'CANCELLED';
  capacity?: number;
  waitlistEnabled?: boolean;
  showGuestList?: boolean;
  timezone?: string;
  // Novos campos
  category?: EventCategory;
  eventType?: EventType;
  price?: number;
  minAge?: number;
  imageUrl?: string;
  onlineUrl?: string;
  tags?: string;
}

export interface AddGuestDto {
  name: string;
  email: string;
}

export interface Announcement {
  id: string;
  message: string;
  eventId: string;
  createdBy: string;
  createdAt: string;
}

class EventsService {
  async getEvents(): Promise<Event[]> {
    return api.get<Event[]>('/events');
  }

  async getMyEvents(): Promise<Event[]> {
    return api.get<Event[]>('/events/my-events');
  }

  async getMyInvites(): Promise<Event[]> {
    return api.get<Event[]>('/events/my-invites');
  }

  async getMyParticipations(): Promise<Event[]> {
    return api.get<Event[]>('/events/my-participations');
  }

  async getEvent(id: string): Promise<Event> {
    return api.get<Event>(`/events/${id}`);
  }

  async createEvent(data: CreateEventDto): Promise<Event> {
    return api.post<Event>('/events', data);
  }

  async updateEvent(id: string, data: UpdateEventDto): Promise<Event> {
    return api.patch<Event>(`/events/${id}`, data);
  }

  async deleteEvent(id: string): Promise<void> {
    return api.delete<void>(`/events/${id}`);
  }

  async getEventGuests(eventId: string): Promise<Guest[]> {
    return api.get<Guest[]>(`/events/${eventId}/guests`);
  }

  async addGuest(eventId: string, data: AddGuestDto): Promise<Guest> {
    return api.post<Guest>(`/events/${eventId}/guests`, data);
  }

  async addGuestsByEmail(eventId: string, emails: string[]): Promise<{ message: string; guests: Guest[] }> {
    return api.post<{ message: string; guests: Guest[] }>(`/events/${eventId}/guests`, { emails });
  }

  async updateGuestStatus(
    eventId: string,
    guestId: string,
    status: GuestStatus
  ): Promise<Guest> {
    return api.patch<Guest>(`/events/${eventId}/guests/${guestId}`, {
      status,
    });
  }

  async updateGuestName(
    eventId: string,
    guestId: string,
    name: string
  ): Promise<Guest> {
    return api.patch<Guest>(`/events/${eventId}/guests/${guestId}`, {
      name,
    });
  }

  async removeGuest(eventId: string, guestId: string): Promise<{ message: string }> {
    return api.delete<{ message: string }>(`/events/${eventId}/guests/${guestId}`);
  }

  async getEventAnnouncements(eventId: string): Promise<Announcement[]> {
    return api.get<Announcement[]>(`/events/${eventId}/announcements`);
  }

  async createAnnouncement(eventId: string, message: string): Promise<Announcement> {
    return api.post<Announcement>(`/events/${eventId}/announcements`, { message });
  }

  async updateAnnouncement(eventId: string, announcementId: string, message: string): Promise<Announcement> {
    return api.patch<Announcement>(`/events/${eventId}/announcements/${announcementId}`, { message });
  }

  async deleteAnnouncement(eventId: string, announcementId: string): Promise<{ message: string }> {
    return api.delete<{ message: string }>(`/events/${eventId}/announcements/${announcementId}`);
  }

  // ============== EMAIL METHODS ==============

  /**
   * Resend invitation email to a specific guest
   */
  async sendInviteToGuest(eventId: string, guestId: string): Promise<{ message: string }> {
    return api.post<{ message: string }>(`/events/${eventId}/guests/${guestId}/send-invite`, {});
  }

  /**
   * Send reminder email to a specific guest
   */
  async sendReminderToGuest(eventId: string, guestId: string): Promise<{ message: string }> {
    return api.post<{ message: string }>(`/events/${eventId}/guests/${guestId}/send-reminder`, {});
  }

  /**
   * Send reminder emails to all guests of an event
   */
  async sendBulkReminders(eventId: string): Promise<{ message: string; sent: number; failed: number }> {
    return api.post<{ message: string; sent: number; failed: number }>(`/events/${eventId}/send-bulk-reminders`, {});
  }
}

export const eventsService = new EventsService();
