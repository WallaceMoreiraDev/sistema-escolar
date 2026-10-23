import { EventDTO, EventoCategoria, LinkDTO } from '@shared/types';

export type EventCategory = EventoCategoria;
export type ClassEvent = EventDTO;
export type UsefulLink = LinkDTO;

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


