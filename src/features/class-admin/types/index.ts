export type EventCategory = 'Prova' | 'Trabalho' | 'Tarefa';

export interface ClassEvent {
  id: string;
  subject: string;
  category: EventCategory;
  dueDate: string;
  description: string;
  attachmentUrl?: string;
  createdAt: string;
}

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
