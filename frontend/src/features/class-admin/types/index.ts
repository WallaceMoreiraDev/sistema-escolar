import { EventDTO, EventoCategoria } from '@shared/types';

export type EventCategory = EventoCategoria;
export type ClassEvent = EventDTO;

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export type MemberRole = 'student' | 'leader';

export interface ClassMember {
  id: string;
  name: string;
  email: string;
  role: MemberRole;
  joinedAt: string;
}

export interface UsefulLink {
  id: string;
  title: string;
  url: string;
  createdAt: string;
}
