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
export type GuestStatus = 'YES' | 'NO' | 'MAYBE' | 'WAITLISTED';

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
  createdAt: string;
  updatedAt: string;
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

class EventsService {
  async getEvents(): Promise<Event[]> {
    return api.get<Event[]>('/events');
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

  async updateGuestStatus(
    eventId: string,
    guestId: string,
    status: GuestStatus
  ): Promise<Guest> {
    return api.patch<Guest>(`/events/${eventId}/guests/${guestId}`, {
      status,
    });
  }

  async removeGuest(eventId: string, guestId: string): Promise<void> {
    return api.delete<void>(`/events/${eventId}/guests/${guestId}`);
  }
}

export const eventsService = new EventsService();
