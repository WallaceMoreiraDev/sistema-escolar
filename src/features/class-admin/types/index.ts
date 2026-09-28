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
