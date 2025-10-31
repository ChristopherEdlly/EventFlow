/**
 * Events Service
 * API calls for event management
 */

import { api } from './api';

export type EventVisibility = 'PUBLIC' | 'PRIVATE';
export type EventState =
  | 'DRAFT'
  | 'PUBLISHED'
  | 'CANCELLED'
  | 'COMPLETED'
  | 'ARCHIVED';
export type GuestStatus = 'YES' | 'NO' | 'MAYBE' | 'WAITLISTED' | 'PENDING';

export interface Event {
  id: string;
  title: string;
  description: string | null;
  date: string;
  time: string | null;
  location: string | null;
  visibility: EventVisibility;
  state: EventState;
  capacity: number | null;
  allowWaitlist: boolean;
  requireApproval: boolean;
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
  createdAt: string;
}

export interface CreateEventDto {
  title: string;
  description?: string;
  date: string;
  time?: string;
  location?: string;
  visibility?: EventVisibility;
  capacity?: number;
  allowWaitlist?: boolean;
  requireApproval?: boolean;
}

export interface UpdateEventDto {
  title?: string;
  description?: string;
  date?: string;
  time?: string;
  location?: string;
  visibility?: EventVisibility;
  state?: EventState;
  capacity?: number;
  allowWaitlist?: boolean;
  requireApproval?: boolean;
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
}

export const eventsService = new EventsService();
